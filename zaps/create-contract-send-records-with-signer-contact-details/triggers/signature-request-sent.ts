import type { Trigger } from "zap-pack";

import dropboxSign from "@/connections/dropbox-sign";

export default {
  app: "dropbox-sign",
  event: "signature_request_sent",
  connection: dropboxSign,
  params: {},
} satisfies Trigger;
