import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  // Look for sample IFC file in known locations
  const possiblePaths = [
    path.resolve("C:/CCAGI/IFC/6_Kiki_hanso.ifc"),
    path.resolve("../IFC/6_Kiki_hanso.ifc"),
    path.resolve("public/samples/sample.ifc"),
  ];

  for (const filePath of possiblePaths) {
    if (existsSync(filePath)) {
      const data = await readFile(filePath);
      return new NextResponse(data, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "inline; filename=sample.ifc",
        },
      });
    }
  }

  return NextResponse.json(
    { error: "Sample IFC file not found" },
    { status: 404 }
  );
}
