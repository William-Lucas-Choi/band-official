import { getUpcomingSchedules } from "@/lib/schedules";

export async function GET() {
  return Response.json(await getUpcomingSchedules());
}
