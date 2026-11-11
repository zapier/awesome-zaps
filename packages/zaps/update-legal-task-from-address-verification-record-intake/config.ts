import { ask } from "zap-pack";

export const INTAKE_TABLE_ID = ask(
  "Zapier Tables table that receives address verification intake rows. The trigger watches it, and processed rows are deleted from it.",
);
export const CLICKUP_TEAM_ID = ask(
  "ClickUp workspace (team) ID that holds the legal tasks.",
);
