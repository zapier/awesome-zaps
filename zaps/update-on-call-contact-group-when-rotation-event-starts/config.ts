import { ask } from "zap-pack";

export const ROUTING_WEBHOOK_URL = ask(
  "Catch-hook URL of the reusable routing workflow that updates the contact group.",
);
// Rotation identifier sent when the event summary matches no known rotation.
export const FALLBACK_ROTATION = "default";
