import { SiteNavigation } from "@/app/components/SiteNavigation";
import { notFound } from "next/navigation";
import { getSchedule } from "@/lib/schedules";

export const revalidate = 900;

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schedule = await getSchedule(id);
  if (!schedule) notFound();
  const date = new Date(schedule.start);
  const dateLabel = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(date);
  const timeLabel = new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" }).format(date);

  return <main className="detail-page">
    <SiteNavigation active="/schedule" />
    <article className="live-detail"><p className="eyebrow">LIVE DETAIL</p><p className="detail-date">{dateLabel}</p><h1>{schedule.title}</h1><div className="detail-grid"><div><p>VENUE</p><strong>{schedule.venue}</strong><span>{schedule.city}</span></div><div><p>START</p><strong>{timeLabel}</strong><span>JST</span></div></div><div className="detail-description"><p>{schedule.description}</p><a href={schedule.ticketUrl ?? "mailto:contact@lacrima-band.jp"} className="solid-button" target={schedule.ticketUrl ? "_blank" : undefined} rel={schedule.ticketUrl ? "noreferrer" : undefined}>TICKET &amp; INFO <span>↗</span></a></div></article>
  </main>;
}
