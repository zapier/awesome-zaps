import type { Trigger } from "zap-pack";

import microsoftTeams from "@/connections/microsoft-teams";

export default {
  app: "microsoft-teams",
  event: "messageList",
  connection: microsoftTeams,
  params: {},
} satisfies Trigger;
