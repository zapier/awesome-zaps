import type { Trigger } from "zap-pack";

import slack from "@/connections/slack";

export default {
  app: "slack",
  event: "new_reaction_added_v3",
  connection: slack,
  params: {},
} satisfies Trigger;
