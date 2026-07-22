import Link from "next/link";
import { SiteNavigation } from "@/app/components/SiteNavigation";
import { getUpcomingSchedules } from "@/lib/schedules";

export const revalidate = 900;

export default async function SchedulePage() {
  const schedules = await getUpcomingSchedules();

  return <main className="schedule-page">
    <SiteNavigation active="/schedule" />
    <section className="schedule-hero"><p className="eyebrow">LIVE SCHEDULE</p><h1>UPCOMING<br /><i>RITUALS.</i></h1><p>今後のライヴスケジュール / Upcoming live dates</p></section>
    <section className="all-schedules" aria-label="Upcoming live schedule">
      {schedules.map((schedule) => {
        const date = new Date(schedule.start);
        return <Link href={`/schedule/${encodeURIComponent(schedule.id)}`} className="schedule-card" key={schedule.id}>
          <time dateTime={schedule.start}><strong>{new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit" }).format(date)}</strong><span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date).toUpperCase()}</span></time>
          <div><p>{schedule.city}</p><h2>{schedule.venue}</h2><span>{schedule.title}</span></div><b>↗</b>
        </Link>;
      })}
    </section>
  </main>;
}
