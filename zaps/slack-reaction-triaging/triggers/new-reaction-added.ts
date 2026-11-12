import type { Trigger } from "zap-pack";

import slack from "@/connections/slack";

export default {
  app: "slack",
  event: "new_reaction_added_v3",
  connection: slack,
  params: {
    emoji: "ticket",
    conversation: {
      ask: "Which channel should the ticket reaction be watched in?",
    },
    // Without a message detail level the trigger sends no message text.
    message_detail: "content",
    enrichments: ["permalink"],
  },
} satisfies Trigger;
