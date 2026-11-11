import type { Trigger } from "zap-pack";

import googleCalendar from "@/connections/google-calendar";

export default {
  app: "google-calendar",
  event: "event_start",
  connection: googleCalendar,
  params: {},
} satisfies Trigger;
