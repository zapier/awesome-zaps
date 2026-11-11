import type { Trigger } from "zap-pack";

import calendly from "@/connections/calendly";

export default {
  app: "calendly",
  event: "invitee_created",
  connection: calendly,
  params: {},
} satisfies Trigger;
