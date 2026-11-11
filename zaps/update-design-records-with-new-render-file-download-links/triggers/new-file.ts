import type { Trigger } from "zap-pack";

import dropbox from "@/connections/dropbox";

export default {
  app: "dropbox",
  event: "new_file",
  connection: dropbox,
  params: {},
} satisfies Trigger;
