import type { Trigger } from "zap-pack";

import googleDrive from "@/connections/google-drive";

export default {
  app: "google-drive",
  event: "file_in_folder_v2",
  connection: googleDrive,
  params: {},
} satisfies Trigger;
