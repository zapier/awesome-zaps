import type { Trigger } from "zap-pack";

import personio from "@/connections/personio";

export default {
  app: "personio",
  event: "employment_terminated_instant",
  connection: personio,
  params: {},
} satisfies Trigger;
