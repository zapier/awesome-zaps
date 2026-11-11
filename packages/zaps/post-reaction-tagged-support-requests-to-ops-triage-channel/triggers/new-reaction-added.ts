import type { Trigger } from "zap-pack";

import slack from "@/connections/slack";

export default {
  app: "slack",
  event: "new_reaction_added_v3",
  connection: slack,
  params: {
    conversation: { constant: "SOURCE_CHANNEL" },
    emoji: { constant: "SUPPORT_REACTION" },
    message_detail: "content",
    enrichments: ["permalink"],
  },
} satisfies Trigger;
