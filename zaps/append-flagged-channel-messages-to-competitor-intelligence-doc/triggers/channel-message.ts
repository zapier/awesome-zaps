import type { Trigger } from "zap-pack";

import slack from "@/connections/slack";

export default {
  app: "slack",
  event: "channel_message",
  connection: slack,
  params: {},
} satisfies Trigger;
