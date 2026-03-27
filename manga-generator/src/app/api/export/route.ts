import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { project_id, format } = await request.json();
    if (!project_id) {
      return NextResponse.json(
        { error: "project_id is required" },
        { status: 400 }
      );
    }

    // Fetch all pages and panels
    const { data: pages } = await supabase
      .from("manga_pages")
      .select("*, panels(*)")
      .eq("project_id", project_id)
      .order("page_number");

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: "No pages found for this project" },
        { status: 404 }
      );
    }

    // Return page/panel data for client-side rendering
    return NextResponse.json({
      format: format || "png",
      pages: pages.map((page: { panels?: { panel_order: number }[] }) => ({
        ...page,
        panels: (page.panels || []).sort(
          (a: { panel_order: number }, b: { panel_order: number }) =>
            a.panel_order - b.panel_order
        ),
      })),
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
