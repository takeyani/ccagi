#!/usr/bin/env node

/**
 * CCAGI 分散処理エンジン
 * 最大7つのエージェントを並列実行し、結果を集約する
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));

const MAX_WORKERS = 7;

// ワーカーの状態管理
const WorkerStatus = {
  PENDING: "pending",
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
};

/**
 * 単一ワーカーを実行
 */
async function runWorker(task, workerId, options = {}) {
  const startTime = Date.now();
  const result = { workerId, task: task.name, status: WorkerStatus.RUNNING, output: "", error: null, costUSD: 0, durationMs: 0 };

  try {
    process.stdout.write(`  [Worker ${workerId}] 開始: ${task.name}\n`);

    const conversation = query({
      prompt: task.prompt,
      options: {
        maxTurns: task.maxTurns ?? options.maxTurns ?? 5,
        permissionMode: options.permissionMode ?? "bypassPermissions",
        systemPrompt: task.systemPrompt ?? options.systemPrompt,
        ...(task.workingDirectory ? { cwd: task.workingDirectory } : {}),
      },
    });

    const textParts = [];
    for await (const message of conversation) {
      if (message.type === "assistant") {
        const text = message.message.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        if (text) textParts.push(text);
      } else if (message.type === "result") {
        result.costUSD = message.costUSD ?? 0;
      }
    }

    result.output = textParts.join("\n");
    result.status = WorkerStatus.DONE;
  } catch (err) {
    result.status = WorkerStatus.ERROR;
    result.error = err.message;
  }

  result.durationMs = Date.now() - startTime;
  process.stdout.write(`  [Worker ${workerId}] 完了: ${task.name} (${(result.durationMs / 1000).toFixed(1)}s, $${result.costUSD.toFixed(4)})\n`);
  return result;
}

/**
 * タスクキューを並列処理（最大 concurrency 同時実行）
 */
async function processQueue(tasks, concurrency, options = {}) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < tasks.length) {
      const currentIndex = index++;
      const task = tasks[currentIndex];
      const result = await runWorker(task, currentIndex + 1, options);
      results.push(result);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => next()
  );
  await Promise.all(workers);

  return results.sort((a, b) => a.workerId - b.workerId);
}

/**
 * 分散処理のメインAPI
 *
 * @param {Object} config
 * @param {Array} config.tasks - 実行するタスク配列 [{ name, prompt, maxTurns?, systemPrompt?, workingDirectory? }]
 * @param {number} config.concurrency - 同時実行数 (最大7)
 * @param {Object} config.options - 共通オプション
 * @param {Function} config.aggregate - 結果集約関数 (optional)
 */
export async function distribute(config) {
  const { tasks, concurrency = MAX_WORKERS, options = {}, aggregate } = config;

  if (!tasks || tasks.length === 0) {
    throw new Error("タスクが指定されていません");
  }

  const actualConcurrency = Math.min(concurrency, MAX_WORKERS);
  const totalStart = Date.now();

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  CCAGI 分散処理エンジン v${pkg.version}`);
  console.log(`  タスク数: ${tasks.length} / 同時実行数: ${actualConcurrency}`);
  console.log(`${"═".repeat(50)}\n`);

  const results = await processQueue(tasks, actualConcurrency, options);

  const totalDuration = Date.now() - totalStart;
  const totalCost = results.reduce((sum, r) => sum + r.costUSD, 0);
  const succeeded = results.filter((r) => r.status === WorkerStatus.DONE).length;
  const failed = results.filter((r) => r.status === WorkerStatus.ERROR).length;

  console.log(`\n${"─".repeat(50)}`);
  console.log(`  完了: ${succeeded}/${tasks.length} 成功, ${failed} 失敗`);
  console.log(`  合計時間: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`  合計コスト: $${totalCost.toFixed(4)}`);
  console.log(`${"─".repeat(50)}\n`);

  // 集約処理
  if (aggregate) {
    console.log("  結果を集約中...\n");
    const aggregated = await aggregate(results);
    return { results, aggregated, totalDuration, totalCost };
  }

  return { results, totalDuration, totalCost };
}

/**
 * 分散処理 + 最終集約エージェント
 * 各ワーカーの結果を1つのエージェントがまとめる
 */
export async function distributeAndAggregate(config) {
  const { tasks, concurrency = MAX_WORKERS, options = {}, aggregatePrompt } = config;

  const { results, totalDuration, totalCost } = await distribute({
    tasks,
    concurrency,
    options,
  });

  if (!aggregatePrompt) {
    return { results, totalDuration, totalCost };
  }

  // 集約エージェント
  console.log("  集約エージェント実行中...\n");
  const summaryParts = results.map(
    (r) =>
      `## Worker ${r.workerId}: ${r.task}\nStatus: ${r.status}\n${r.status === "done" ? r.output : `Error: ${r.error}`}`
  );

  const aggregateResult = await runWorker(
    {
      name: "集約",
      prompt: `${aggregatePrompt}\n\n以下は各ワーカーの結果です:\n\n${summaryParts.join("\n\n---\n\n")}`,
      maxTurns: 3,
    },
    0,
    options
  );

  return {
    results,
    aggregated: aggregateResult,
    totalDuration: Date.now() - (Date.now() - totalDuration),
    totalCost: totalCost + aggregateResult.costUSD,
  };
}

// CLI実行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`ccagi distributed v${pkg.version}

Usage: node distributed.js [options] <tasks-json-or-prompts...>

Options:
  -c, --concurrency <n>  同時実行数 (1-7, default: 7)
  -t, --turns <n>        最大ターン数 (default: 5)
  --aggregate <prompt>   結果集約プロンプト
  -h, --help             ヘルプ

Examples:
  # 3つのプロンプトを並列実行
  node distributed.js "タスク1" "タスク2" "タスク3"

  # 同時実行数を3に制限
  node distributed.js -c 3 "タスク1" "タスク2" "タスク3" "タスク4" "タスク5"

  # JSONファイルからタスク読み込み
  node distributed.js --file tasks.json

  # 結果を集約
  node distributed.js --aggregate "結果をまとめて" "調査1" "調査2" "調査3"`);
    process.exit(0);
  }

  let concurrency = MAX_WORKERS;
  let maxTurns = 5;
  let aggregatePrompt = null;
  let tasksFile = null;
  const prompts = [];

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "-c" || args[i] === "--concurrency") && args[i + 1]) {
      concurrency = Math.min(parseInt(args[++i], 10), MAX_WORKERS);
    } else if ((args[i] === "-t" || args[i] === "--turns") && args[i + 1]) {
      maxTurns = parseInt(args[++i], 10);
    } else if (args[i] === "--aggregate" && args[i + 1]) {
      aggregatePrompt = args[++i];
    } else if (args[i] === "--file" && args[i + 1]) {
      tasksFile = args[++i];
    } else {
      prompts.push(args[i]);
    }
  }

  let tasks;
  if (tasksFile) {
    tasks = JSON.parse(readFileSync(tasksFile, "utf-8"));
  } else if (prompts.length > 0) {
    tasks = prompts.map((p, i) => ({ name: `タスク${i + 1}`, prompt: p }));
  } else {
    // デモモード: 7並列のデモタスク
    tasks = [
      { name: "システム状態確認", prompt: "現在のシステム状態を簡潔に報告して" },
      { name: "Git状態確認", prompt: "git statusとgit logの最新5件を報告して" },
      { name: "依存関係チェック", prompt: "package.jsonの依存関係に問題がないか確認して" },
      { name: "セキュリティ監査", prompt: ".envファイルにシークレットが漏れていないか確認して" },
      { name: "テスト実行", prompt: "利用可能なテストを実行して結果を報告して" },
      { name: "ビルドチェック", prompt: "プロジェクトがビルドできるか確認して" },
      { name: "ドキュメント確認", prompt: "README.mdやCLAUDE.mdの内容を確認して報告して" },
    ];
    aggregatePrompt = "各ワーカーの結果を統合して、プロジェクトの健全性レポートを日本語で作成してください。";
  }

  const fn = aggregatePrompt ? distributeAndAggregate : distribute;
  fn({
    tasks,
    concurrency,
    options: { maxTurns },
    aggregatePrompt,
  })
    .then((result) => {
      if (result.aggregated) {
        console.log("\n═══ 集約結果 ═══\n");
        console.log(result.aggregated.output || result.aggregated);
      }
    })
    .catch(console.error);
}
