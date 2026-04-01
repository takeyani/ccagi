// トリアージ漫画生成スクリプト
import fs from "fs";
import path from "path";

const PROJECT_ID = "mock-1774632411285-8onvr8";

const INPUT_TEXT = [
  "Scene 1: A dark emergency room. A doctor holds triage tags - green, yellow, red, black. You are already being triaged. But this time, its not medicine - its business.",
  "Scene 2: A confident businessman with a green tag glows with digital networks and data flowing around him. He stands on a platform labeled CCAGI. Green tag - already holds influence that money cannot buy.",
  "Scene 3: A worried office worker with a yellow tag looks at a clock ticking down. Screens around him show AI and blockchain news. Yellow tag - knows change is coming but hasnt moved yet.",
  "Scene 4: A calm businessman with a red tag sits in his comfortable office, unaware. Behind the window, a digital tsunami approaches. This calm is the most dangerous.",
  "Scene 5: A destroyed landscape with fallen buildings labeled Rental Video, Taxi Company. Black tags scattered everywhere. Netflix, Uber logos shine above. Black tag - they never entered the structure.",
  "Scene 6: Sunrise over a new city. People with green tags walk forward into a colorful future. One person reaches back to pull a yellow-tagged person forward. Your tag color can be changed by your own will.",
].join(" ");

const OUTPUT_DIR = path.join(process.cwd(), "output-triage");

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log("Generating triage manga...\n");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 min timeout

  const res = await fetch("http://localhost:3000/api/generate/manga", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: PROJECT_ID,
      input_text: INPUT_TEXT,
      tonmana_config: {
        art_style: "seinen",
        genre: "sci_fi",
        color_mode: "full_color",
        line_style: "clean",
        custom_prompt: "Cinematic business manga about information triage. Use green yellow red black tag colors dramatically. Near-future cyberpunk aesthetic.",
      },
    }),
    signal: controller.signal,
  });

  console.log("Status:", res.status);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete lines
    while (buffer.includes("\n")) {
      const newlineIdx = buffer.indexOf("\n");
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);

      if (!line.startsWith("data: ")) continue;

      try {
        const data = JSON.parse(line.slice(6));

        if (data.message) {
          console.log(`  ${data.message}`);
        }

        if (data.index !== undefined) {
          console.log(`  Panel ${data.index + 1}/${data.total} complete`);
        }

        if (data.panels) {
          finalResult = data;
        }
      } catch {}
    }
  }

  clearTimeout(timeout);

  if (finalResult) {
    console.log(`\n=== ${finalResult.panels.length} panels generated ===\n`);
    const savedFiles = [];

    for (const panel of finalResult.panels) {
      const idx = panel.panel_order + 1;
      const hasRealImage = panel.image_url && panel.image_url.startsWith("data:image/png");
      console.log(`Panel ${idx}: ${hasRealImage ? "OpenAI image" : "Placeholder"}`);
      console.log(`  Scene: ${panel.scene_description.slice(0, 100)}`);

      if (panel.image_url) {
        const ext = hasRealImage ? "png" : "svg";
        const base64 = panel.image_url.replace(/^data:image\/\w+;base64,/, "");
        const filename = `triage_panel_${idx}.${ext}`;
        const filepath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filepath, Buffer.from(base64, "base64"));
        console.log(`  Saved: ${filepath}`);
        savedFiles.push(filepath);
      }
    }

    console.log(`\nAll ${savedFiles.length} images saved to ${OUTPUT_DIR}`);
  } else {
    console.log("\nNo result received. Check server logs.");
  }
}

main().catch(console.error);
