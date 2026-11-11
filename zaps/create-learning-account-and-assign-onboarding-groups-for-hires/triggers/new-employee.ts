import type { Trigger } from "zap-pack";

import bamboohr from "@/connections/bamboohr";

export default {
  app: "bamboohr",
  event: "new_employee",
  connection: bamboohr,
  params: {},
} satisfies Trigger;
