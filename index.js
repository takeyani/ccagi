import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const conversation = query({
    prompt: "Hello! What can you do?",
    options: {
      maxTurns: 3,
      permissionMode: "bypassPermissions",
    },
  });

  for await (const message of conversation) {
    if (message.type === "assistant") {
      console.log("\n[Assistant]:", message.message.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("\n"));
    } else if (message.type === "result") {
      console.log("\n[Done] Exit reason:", message.exitReason);
      console.log("Total cost: $" + (message.costUSD ?? 0).toFixed(4));
    }
  }
}

main().catch(console.error);
