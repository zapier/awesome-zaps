import { ask } from "zap-pack";

export const ROTATION_TABLE_ID = ask(
  "Zapier Tables ID of the expert rotation table. Columns: f1 Name, f2 Email, f3 Next (checkbox), f4 Assigned count (number), f5 Rotation order (number), f6 Gmail label ID.",
);
export const FALLBACK_EMAIL = ask(
  "Address that receives the request when no record in the table is marked Next.",
);
// Hidden marker written into each reply, so a request that was already routed is skipped.
export const PROCESSED_MARKER = "rotation-routed";
