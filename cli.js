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
  status         Show system status
  <prompt>       Send a prompt to Claude

Options:
  -v, --version  Show version
  -h, --help     Show help

Examples:
  ccagi-sdk status
  ccagi-sdk "日本語で自己紹介して"
  ccagi-sdk "Fix the bug in auth.js"`);
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

  process.exit(0);
}

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
