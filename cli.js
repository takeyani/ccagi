#!/usr/bin/env node

// Allow running inside a Claude Code session
delete process.env.CLAUDECODE;

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(`ccagi-sdk v${pkg.version}`);
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`ccagi-sdk v${pkg.version}

Usage: ccagi-sdk [command] [options] [prompt]

Commands:
  status              Show system status
  distribute [opts]   分散処理 (最大7並列)
  <prompt>            Send a prompt to Claude

Distribute Options:
  -c, --concurrency <n>  同時実行数 (1-7, default: 7)
  -t, --turns <n>        最大ターン数 (default: 5)
  --aggregate <prompt>   結果集約プロンプト
  --file <path>          タスクJSONファイル

Options:
  -v, --version  Show version
  -h, --help     Show help

Examples:
  ccagi-sdk status
  ccagi-sdk "日本語で自己紹介して"
  ccagi-sdk distribute "タスク1" "タスク2" "タスク3"
  ccagi-sdk distribute -c 3 --aggregate "まとめて" "調査1" "調査2" "調査3"
  ccagi-sdk distribute --file tasks.json`);
  process.exit(0);
}

if (args[0] === "status") {
  const { execSync } = await import("child_process");
  const ghPath = "C:\\Program Files\\GitHub CLI\\gh.exe";

  console.log(`ccagi-sdk v${pkg.version}`);
  console.log("─".repeat(35));

  // Node.js
  console.log(`Node.js:       ${process.version}`);

  // Claude Agent SDK
  try {
    const sdkPkg = JSON.parse(readFileSync(join(__dirname, "node_modules/@anthropic-ai/claude-agent-sdk/package.json"), "utf-8"));
    console.log(`Agent SDK:     v${sdkPkg.version}`);
  } catch { console.log("Agent SDK:     not found"); }

  // Claude Code
  try {
    const ccVer = execSync("claude --version 2>&1", { encoding: "utf-8" }).trim();
    console.log(`Claude Code:   ${ccVer}`);
  } catch { console.log("Claude Code:   not found"); }

  // GitHub
  try {
    const ghAuth = execSync(`"${ghPath}" auth status 2>&1`, { encoding: "utf-8" });
    const account = ghAuth.match(/account (\S+)/)?.[1] ?? "unknown";
    console.log(`GitHub:        ${account} (authenticated)`);
  } catch { console.log("GitHub:        not authenticated"); }

  // Git remote
  try {
    const remote = execSync("git remote get-url origin 2>&1", { encoding: "utf-8" }).trim();
    console.log(`Remote:        ${remote}`);
  } catch { console.log("Remote:        not configured"); }

  // 分散処理
  console.log(`Distributed:   max 7 workers`);

  process.exit(0);
}

// 分散処理コマンド
if (args[0] === "distribute") {
  const { distribute, distributeAndAggregate } = await import("./distributed.js");

  const subArgs = args.slice(1);
  let concurrency = 7;
  let maxTurns = 5;
  let aggregatePrompt = null;
  let tasksFile = null;
  const prompts = [];

  for (let i = 0; i < subArgs.length; i++) {
    if ((subArgs[i] === "-c" || subArgs[i] === "--concurrency") && subArgs[i + 1]) {
      concurrency = Math.min(parseInt(subArgs[++i], 10), 7);
    } else if ((subArgs[i] === "-t" || subArgs[i] === "--turns") && subArgs[i + 1]) {
      maxTurns = parseInt(subArgs[++i], 10);
    } else if (subArgs[i] === "--aggregate" && subArgs[i + 1]) {
      aggregatePrompt = subArgs[++i];
    } else if (subArgs[i] === "--file" && subArgs[i + 1]) {
      tasksFile = subArgs[++i];
    } else {
      prompts.push(subArgs[i]);
    }
  }

  let tasks;
  if (tasksFile) {
    tasks = JSON.parse(readFileSync(tasksFile, "utf-8"));
  } else if (prompts.length > 0) {
    tasks = prompts.map((p, i) => ({ name: `タスク${i + 1}`, prompt: p }));
  } else {
    // デモ: 7並列ヘルスチェック
    tasks = [
      { name: "システム状態", prompt: "現在のシステム状態を簡潔に報告して" },
      { name: "Git状態", prompt: "git statusとgit log最新5件を報告して" },
      { name: "依存関係", prompt: "package.jsonの依存関係を確認して" },
      { name: "セキュリティ", prompt: ".envファイルにシークレット漏れがないか確認して" },
      { name: "テスト", prompt: "利用可能なテストを実行して結果を報告して" },
      { name: "ビルド", prompt: "プロジェクトがビルドできるか確認して" },
      { name: "ドキュメント", prompt: "README.mdやCLAUDE.mdの内容を確認して報告して" },
    ];
    aggregatePrompt = "各ワーカーの結果を統合して、プロジェクトの健全性レポートを日本語で作成してください。";
  }

  const fn = aggregatePrompt ? distributeAndAggregate : distribute;
  fn({ tasks, concurrency, options: { maxTurns }, aggregatePrompt })
    .then((result) => {
      if (result.aggregated) {
        console.log("\n═══ 集約結果 ═══\n");
        console.log(result.aggregated.output || result.aggregated);
      }
    })
    .catch(console.error);
} else {
  // 通常のプロンプト実行
  const prompt = args.join(" ") || "Hello! What can you do?";

  async function main() {
    const conversation = query({
      prompt,
      options: {
        maxTurns: 3,
        permissionMode: "bypassPermissions",
      },
    });

    for await (const message of conversation) {
      if (message.type === "assistant") {
        const text = message.message.content
          .filter(block => block.type === "text")
          .map(block => block.text)
          .join("\n");
        if (text) console.log(text);
      } else if (message.type === "result") {
        console.log("\n[Done]", message.exitReason ?? "success");
      }
    }
  }

  main().catch(console.error);
}
