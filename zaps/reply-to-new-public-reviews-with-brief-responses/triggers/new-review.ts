import type { Trigger } from "zap-pack";

import googleBusinessProfile from "@/connections/google-business-profile";

export default {
  app: "google-business-profile",
  event: "new_review_v3",
  connection: googleBusinessProfile,
  params: {},
} satisfies Trigger;
