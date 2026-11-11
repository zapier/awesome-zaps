import type { Trigger } from "zap-pack";

import ashby from "@/connections/ashby";

export default {
  app: "ashby",
  event: "candidate_hired",
  connection: ashby,
  params: {},
} satisfies Trigger;
