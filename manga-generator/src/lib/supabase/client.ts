"use client";

import { createBrowserClient } from "@supabase/ssr";

const DEV_MODE =
  typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL;

function createMockBrowserClient() {
  const mockUser = {
    id: "dev-user-00000000-0000-0000-0000-000000000000",
    email: "dev@example.com",
    app_metadata: {},
    user_metadata: { display_name: "開発ユーザー" },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  const emptyResult = { data: [], error: null };

  const queryBuilder = () => {
    let pendingInsert: Record<string, unknown> | null = null;
    const builder: Record<string, unknown> = {};
    const methods = ["select", "insert", "update", "upsert", "delete", "eq", "in", "order", "limit", "single", "neq", "gt", "lt", "gte", "lte", "like", "ilike", "is", "not", "or", "filter"];
    for (const m of methods) {
      builder[m] = (...args: unknown[]) => {
        if (m === "insert" && args[0] && typeof args[0] === "object") {
          pendingInsert = args[0] as Record<string, unknown>;
        }
        if (m === "single") {
          if (pendingInsert) {
            return {
              data: {
                id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...pendingInsert,
              },
              error: null,
            };
          }
          return { data: null, error: null };
        }
        return builder;
      };
    }
    builder.then = (resolve: (v: unknown) => void) => resolve(emptyResult);
    return builder;
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser, session: null }, error: null }),
      signUp: async () => ({ data: { user: mockUser, session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (_table: string) => queryBuilder(),
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/mock-storage/${path}` } }),
      }),
    },
  };
}

export function createSupabaseBrowserClient() {
  if (DEV_MODE) {
    return createMockBrowserClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
