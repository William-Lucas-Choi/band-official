import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      live_events: {
        Row: {
          id: string;
          calendar_event_id: string | null;
          title: string;
          starts_at: string;
          ends_at: string | null;
          venue: string;
          city: string;
          description: string;
          ticket_url: string | null;
          image_url: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          calendar_event_id?: string | null;
          title: string;
          starts_at: string;
          ends_at?: string | null;
          venue: string;
          city?: string;
          description?: string;
          ticket_url?: string | null;
          image_url?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          calendar_event_id?: string | null;
          title?: string;
          starts_at?: string;
          ends_at?: string | null;
          venue?: string;
          city?: string;
          description?: string;
          ticket_url?: string | null;
          image_url?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type AppSupabaseClient = SupabaseClient<Database>;

let client: AppSupabaseClient | null | undefined;
let browserClient: AppSupabaseClient | null | undefined;

/**
 * Public content is read with Supabase's publishable key. The client is
 * initialized lazily so local builds also work before environment variables
 * have been configured.
 */
export function getSupabaseClient() {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    client = null;
    return client;
  }

  client = createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}

/**
 * Browser-only client for Supabase Auth. Session persistence is intentionally
 * enabled here, while the server-side public-content client remains stateless.
 */
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") return null;
  if (browserClient !== undefined) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient<Database>(url, publishableKey);
  return browserClient;
}
