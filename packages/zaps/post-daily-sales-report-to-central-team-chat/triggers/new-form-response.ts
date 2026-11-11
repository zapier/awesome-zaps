import type { Trigger } from "zap-pack";

import googleForms from "@/connections/google-forms";

export default {
  app: "google-forms",
  event: "new_form_response",
  connection: googleForms,
  params: {},
} satisfies Trigger;
