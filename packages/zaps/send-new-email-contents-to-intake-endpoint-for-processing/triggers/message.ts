import type { Trigger } from "zap-pack";

import gmail from "@/connections/gmail";

export default {
  app: "gmail",
  event: "message",
  connection: gmail,
  params: {},
} satisfies Trigger;
