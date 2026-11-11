import type { Trigger } from "zap-pack";

import instagramForBusiness from "@/connections/instagram-for-business";

export default {
  app: "instagram-for-business",
  event: "new_tag",
  connection: instagramForBusiness,
  params: {},
} satisfies Trigger;
