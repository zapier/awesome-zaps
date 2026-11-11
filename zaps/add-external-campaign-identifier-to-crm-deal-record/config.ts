import { ask } from "zap-pack";

export const EXTERNAL_ID_FIELD = ask(
  "Pipedrive custom deal field key that stores the external campaign identifier (the field's key under Settings > Data fields).",
);
