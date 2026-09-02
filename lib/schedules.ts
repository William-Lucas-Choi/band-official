import { getSupabaseClient } from "@/lib/supabase";
import { unstable_cache } from "next/cache";

export type Schedule = {
  id: string;
  title: string;
  start: string;
  end?: string;
  venue: string;
  city: string;
  description: string;
  ticketUrl?: string;
};

type LiveEventRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string;
  city: string;
  description: string;
  ticket_url: string | null;
};

export const demoSchedules: Schedule[] = [
  { id: "silence-of-roses", title: "ONEMAN LIVE 2026 \"SILENCE OF ROSES\"", start: "2026-08-24T18:00:00+09:00", venue: "Shibuya REX", city: "TOKYO", description: "LACRIMA ONEMAN LIVE 2026. Doors 17:30 / Start 18:00." },
  { id: "eclipse-osaka", title: "ECLIPSE TOUR 2026", start: "2026-09-06T18:00:00+09:00", venue: "OSAKA MUSE", city: "OSAKA", description: "ECLIPSE TOUR 2026 OSAKA. Doors 17:30 / Start 18:00." },
  { id: "eclipse-nagoya", title: "ECLIPSE TOUR 2026", start: "2026-09-21T18:00:00+09:00", venue: "ell.FITS ALL", city: "NAGOYA", description: "ECLIPSE TOUR 2026 NAGOYA. Doors 17:30 / Start 18:00." },
];

export function getDemoUpcomingSchedules() {
  return demoSchedules
    .filter((schedule) => new Date(schedule.start).getTime() >= Date.now())
    .sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());
}

async function getSupabaseUpcomingSchedules(): Promise<Schedule[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("live_events")
    .select("id, title, starts_at, ends_at, venue, city, description, ticket_url")
    .eq("published", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error || !data) return null;

  return (data as LiveEventRow[]).map((event) => ({
    id: event.id,
    title: event.title,
    start: event.starts_at,
    end: event.ends_at ?? undefined,
    venue: event.venue,
    city: event.city.toUpperCase(),
    description: event.description,
    ticketUrl: event.ticket_url ?? undefined,
  }));
}

function toScheduleFromLiveEvent(event: LiveEventRow): Schedule {
  return {
    id: event.id,
    title: event.title,
    start: event.starts_at,
    end: event.ends_at ?? undefined,
    venue: event.venue,
    city: event.city.toUpperCase(),
    description: event.description,
    ticketUrl: event.ticket_url ?? undefined,
  };
}

async function getSupabaseSchedule(id: string): Promise<Schedule | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("live_events")
    .select("id, title, starts_at, ends_at, venue, city, description, ticket_url")
    .eq("id", id)
    .eq("published", true)
    .gte("starts_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return toScheduleFromLiveEvent(data as LiveEventRow);
}

type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

function toSchedule(event: GoogleEvent): Schedule | null {
  const start = event.start?.dateTime ?? event.start?.date;
  if (!start) return null;
  const [venue = "TBA", city = ""] = (event.location ?? "TBA").split(/[,，]/).map((value) => value.trim());
  return {
    id: event.id,
    title: event.summary ?? "LACRIMA LIVE",
    start,
    end: event.end?.dateTime ?? event.end?.date,
    venue,
    city: city.toUpperCase(),
    description: event.description ?? "Details will be announced soon.",
  };
}

async function getGoogleUpcomingSchedules(): Promise<Schedule[] | null> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (!calendarId || !apiKey) return null;

  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: new Date().toISOString(),
    maxResults: "50",
  });
  const endpoint = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
  const response = await fetch(endpoint, { next: { revalidate: 900 } });
  if (!response.ok) return null;

  const payload = (await response.json()) as { items?: GoogleEvent[] };
  return (payload.items ?? []).map(toSchedule).filter((event): event is Schedule => Boolean(event));
}

export async function getUpcomingSchedules(): Promise<Schedule[]> {
  const supabaseSchedules = await getSupabaseUpcomingSchedules();
  if (supabaseSchedules?.length) return supabaseSchedules;

  return (await getGoogleUpcomingSchedules()) ?? getDemoUpcomingSchedules();
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getScheduleUncached(id: string): Promise<Schedule | null> {
  const demoSchedule = getDemoUpcomingSchedules().find((schedule) => schedule.id === id);
  if (demoSchedule) return demoSchedule;

  if (uuidPattern.test(id)) return getSupabaseSchedule(id);

  return (await getGoogleUpcomingSchedules())?.find((schedule) => schedule.id === id) ?? null;
}

export async function getSchedule(id: string): Promise<Schedule | null> {
  return unstable_cache(
    () => getScheduleUncached(id),
    ["live-event-detail", id],
    { tags: [`live-event-${id}`], revalidate: 3600 },
  )();
}
