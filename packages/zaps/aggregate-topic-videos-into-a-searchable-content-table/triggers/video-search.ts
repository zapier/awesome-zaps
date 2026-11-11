import type { Trigger } from "zap-pack";

import youtube from "@/connections/youtube";

export default {
  app: "youtube",
  event: "video_search",
  connection: youtube,
  params: {},
} satisfies Trigger;
