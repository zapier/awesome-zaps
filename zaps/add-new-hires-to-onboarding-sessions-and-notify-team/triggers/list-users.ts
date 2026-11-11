import type { Trigger } from "zap-pack";

import googleWorkspaceAdmin from "@/connections/google-workspace-admin";

export default {
  app: "google-workspace-admin",
  event: "list_users",
  connection: googleWorkspaceAdmin,
  params: {},
} satisfies Trigger;
