import type { Trigger } from "zap-pack";

import googleCalendar from "@/connections/google-calendar";

export default {
  app: "google-calendar",
  event: "new_event",
  connection: googleCalendar,
  params: {},
} satisfies Trigger;
