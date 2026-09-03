import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

type GoogleCalendarEvent = {
  id?: string;
  status?: string;
  summary?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

type CalendarEventRow = {
  calendar_event_id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string;
  city: string;
  updated_at: string;
};

function getEventDateTime(value?: { dateTime?: string; date?: string }) {
  if (value?.dateTime) return value.dateTime;
  return value?.date ? `${value.date}T00:00:00+09:00` : null;
}

function toCalendarEventRow(event: GoogleCalendarEvent): CalendarEventRow | null {
  const id = event.id;
  const startsAt = getEventDateTime(event.start);
  if (!id || !startsAt) return null;
  const [venue = "TBA", city = ""] = (event.location ?? "TBA").split(/[,，]/).map((value) => value.trim());
  return { calendar_event_id: id, title: event.summary ?? "LACRIMA LIVE", starts_at: startsAt, ends_at: getEventDateTime(event.end), venue, city, updated_at: new Date().toISOString() };
}

function getConfiguration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const calendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!supabaseUrl || !publishableKey || !secretKey || !calendarId || !calendarApiKey) return null;
  return { supabaseUrl, publishableKey, secretKey, calendarId, calendarApiKey };
}

async function isAdmin(accessToken: string, configuration: NonNullable<ReturnType<typeof getConfiguration>>) {
  const client = createClient<Database>(configuration.supabaseUrl, configuration.publishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: { user }, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !user) return false;
  const { data: adminRecord } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return Boolean(adminRecord);
}

async function syncCalendar() {
  const configuration = getConfiguration();
  if (!configuration) return { error: "Calendar sync configuration is incomplete", status: 503 };

  const params = new URLSearchParams({ key: configuration.calendarApiKey, singleEvents: "true", orderBy: "startTime", timeMin: new Date().toISOString(), maxResults: "250" });
  const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(configuration.calendarId)}/events?${params}`, { cache: "no-store" });
  if (!calendarResponse.ok) return { error: "Could not read Google Calendar", status: 502 };

  const payload = (await calendarResponse.json()) as { items?: GoogleCalendarEvent[] };
  const events = payload.items ?? [];
  const activeEvents = events.filter((event) => event.status !== "cancelled").map(toCalendarEventRow).filter((event): event is CalendarEventRow => Boolean(event));
  const cancelledIds = events.filter((event) => event.status === "cancelled" && event.id).map((event) => event.id as string);
  const adminClient = createClient<Database>(configuration.supabaseUrl, configuration.secretKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const calendarIds = activeEvents.map((event) => event.calendar_event_id);
  const { data: existingEvents, error: existingError } = calendarIds.length
    ? await adminClient.from("live_events").select("id, calendar_event_id").in("calendar_event_id", calendarIds)
    : { data: [], error: null };
  if (existingError) return { error: "Could not read existing schedules", status: 502 };

  const existingCalendarIds = new Set((existingEvents ?? []).map((event) => event.calendar_event_id).filter((id): id is string => Boolean(id)));
  const { data: syncedEvents, error: upsertError } = activeEvents.length
    ? await adminClient.from("live_events").upsert(activeEvents, { onConflict: "calendar_event_id" }).select("id, calendar_event_id")
    : { data: [], error: null };
  if (upsertError) return { error: "Could not save schedules", status: 502 };

  const createdIds = (syncedEvents ?? []).filter((event) => event.calendar_event_id && !existingCalendarIds.has(event.calendar_event_id)).map((event) => event.id);
  if (createdIds.length) {
    const { error: publishError } = await adminClient.from("live_events").update({ published: true }).in("id", createdIds);
    if (publishError) return { error: "Could not publish new schedules", status: 502 };
  }
  if (cancelledIds.length) {
    const { error: cancelError } = await adminClient.from("live_events").update({ published: false, updated_at: new Date().toISOString() }).in("calendar_event_id", cancelledIds);
    if (cancelError) return { error: "Could not hide cancelled schedules", status: 502 };
  }

  for (const event of syncedEvents ?? []) revalidateTag(`live-event-${event.id}`, { expire: 0 });
  revalidatePath("/", "page");
  revalidatePath("/schedule", "page");
  return { synced: activeEvents.length, created: createdIds.length, cancelled: cancelledIds.length, status: 200 };
}

export async function POST(request: Request) {
  const configuration = getConfiguration();
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!configuration || !accessToken || !(await isAdmin(accessToken, configuration))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await syncCalendar();
  return Response.json(result, { status: result.status });
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const result = await syncCalendar();
  return Response.json(result, { status: result.status });
}
