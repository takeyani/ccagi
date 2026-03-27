import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEV_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

// In-memory store for mock mode — persists across requests within the same server process
const mockStore: Record<string, Record<string, unknown>[]> = {};

function getStore(table: string): Record<string, unknown>[] {
  if (!mockStore[table]) mockStore[table] = [];
  return mockStore[table];
}

function createMockClient() {
  const mockUser = {
    id: "dev-user-00000000-0000-0000-0000-000000000000",
    email: "dev@example.com",
    app_metadata: {},
    user_metadata: { display_name: "開発ユーザー" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  const MOCK_DEFAULTS: Record<string, Record<string, unknown>> = {
    projects: {
      title: "デモプロジェクト",
      status: "draft",
      tonmana_config: { art_style: "shonen", genre: "action", color_mode: "monochrome", line_style: "bold" },
      default_provider: "openai",
      character_ids: [],
      user_id: mockUser.id,
    },
    characters: {
      name: "サンプルキャラ",
      appearance_description: "黒髪の少年",
      visual_prompt: "black-haired boy",
      reference_images: [],
      user_id: mockUser.id,
    },
    manga_pages: { page_number: 1, layout_template: "auto", layout_config: null, panels: [] },
    panels: { panel_order: 0, image_url: null, scene_description: "", dialogue: [], sound_effects: [], layout_rect: { x: 0, y: 0, w: 0.5, h: 0.5 } },
    generations: { input_text: "", panel_breakdown: [], provider: "openai", status: "completed", result: null, user_id: mockUser.id },
    user_profiles: { display_name: "開発ユーザー", default_provider: "openai", api_keys: {} },
  };

  const queryBuilder = (table?: string) => {
    let pendingInsert: Record<string, unknown> | null = null;
    let pendingUpdate: Record<string, unknown> | null = null;
    const eqFilters: Record<string, unknown> = {};
    const builder: Record<string, unknown> = {};
    const methods = ["select", "insert", "update", "upsert", "delete", "eq", "in", "order", "limit", "single", "neq", "gt", "lt", "gte", "lte", "like", "ilike", "is", "not", "or", "filter"];

    for (const m of methods) {
      builder[m] = (...args: unknown[]) => {
        if (m === "insert" && args[0] && typeof args[0] === "object") {
          pendingInsert = args[0] as Record<string, unknown>;
        }
        if (m === "update" && args[0] && typeof args[0] === "object") {
          pendingUpdate = args[0] as Record<string, unknown>;
        }
        if (m === "eq" && typeof args[0] === "string") {
          eqFilters[args[0] as string] = args[1];
        }
        if (m === "single") {
          // INSERT: create new record and store it
          if (pendingInsert && table) {
            const record = {
              id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...pendingInsert,
            };
            getStore(table).push(record);
            return { data: record, error: null };
          }
          // UPDATE: apply to stored record
          if (pendingUpdate && table && eqFilters["id"]) {
            const store = getStore(table);
            const idx = store.findIndex((r) => r.id === eqFilters["id"]);
            if (idx >= 0) {
              Object.assign(store[idx], pendingUpdate, { updated_at: new Date().toISOString() });
              return { data: store[idx], error: null };
            }
          }
          // SELECT: find in store first, then fall back to defaults
          if (eqFilters["id"] && table) {
            const store = getStore(table);
            const found = store.find((r) => r.id === eqFilters["id"]);
            if (found) {
              return { data: found, error: null };
            }
            // Fallback to defaults for pages that load directly
            if (MOCK_DEFAULTS[table]) {
              return {
                data: {
                  id: eqFilters["id"],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...MOCK_DEFAULTS[table],
                },
                error: null,
              };
            }
          }
          return { data: null, error: null };
        }
        // For non-single queries (update without single, delete, etc.)
        if (m === "update" || m === "delete") {
          // Apply update to matching records in store
          if (m === "update" && table && args[0] && typeof args[0] === "object") {
            // Will be applied when eq is called
          }
        }
        return builder;
      };
    }

    // For queries that resolve as promises (like .select().eq().order())
    builder.then = (resolve: (v: unknown) => void) => {
      if (table) {
        const store = getStore(table);
        let results = [...store];
        // Apply eq filters
        for (const [key, val] of Object.entries(eqFilters)) {
          results = results.filter((r) => r[key] === val);
        }
        resolve({ data: results, error: null });
      } else {
        resolve({ data: [], error: null });
      }
    };

    return builder;
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser, session: null }, error: null }),
      signUp: async () => ({ data: { user: mockUser, session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => queryBuilder(table),
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/mock-storage/${path}` } }),
      }),
    },
  };
}

export async function createSupabaseServerClient() {
  if (DEV_MODE) {
    return createMockClient() as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
