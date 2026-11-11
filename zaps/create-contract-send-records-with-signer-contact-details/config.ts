import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table ID that holds one row per signer (the table's ID from its URL).",
);
