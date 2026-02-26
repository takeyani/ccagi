#!/usr/bin/env node

// Allow running inside a Claude Code session
delete process.env.CLAUDECODE;

import { query } from "@anthropic-ai/claude-agent-sdk";

const prompt = process.argv.slice(2).join(" ") || "Hello! What can you do?";

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
