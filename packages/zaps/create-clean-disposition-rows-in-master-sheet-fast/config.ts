import { ask } from "zap-pack";

export const SOURCE_SPREADSHEET_ID = ask(
  "Source spreadsheet ID the trigger watches (the long ID in the sheet's URL). Set on the trigger.",
);
// Worksheet (tab) the trigger watches; the first tab is "0". Set on the trigger.
export const SOURCE_WORKSHEET_ID = "0";
export const MASTER_SPREADSHEET_ID = ask(
  "Master spreadsheet ID that receives the cleaned rows.",
);
// Worksheet (tab) in the master spreadsheet; the first tab is "0".
export const MASTER_WORKSHEET_ID = "0";
// Written to the master row when the text matches none of the allowed dispositions.
export const REVIEW_DISPOSITION = "Needs review";
// AI by Zapier model tier. Prompt-only, so no tool-capable model is needed.
export const MODEL_ID = "standard/auto";
