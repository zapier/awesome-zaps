import type { Trigger } from "zap-pack";

import zoom from "@/connections/zoom";

export default {
  app: "zoom",
  event: "new_recording",
  connection: zoom,
  params: {},
} satisfies Trigger;
