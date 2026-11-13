// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SOURCE_SPREADSHEET_ID = "REPLACE_SOURCE_SPREADSHEET_ID"; // Ask the user which spreadsheet holds the campaign disposition rows, then look up its ID with their Google Sheets connection. Also set it on the trigger.
export const MASTER_SPREADSHEET_ID = "REPLACE_MASTER_SPREADSHEET_ID"; // Ask the user which spreadsheet is the master sheet that receives the cleaned rows, then look up its ID with their Google Sheets connection.

// Worksheet (tab) the trigger watches; the first tab is "0". Set on the trigger.
export const SOURCE_WORKSHEET_ID = "0";
// Worksheet (tab) in the master spreadsheet; the first tab is "0".
export const MASTER_WORKSHEET_ID = "0";
// Written to the master row when the text matches none of the allowed dispositions.
export const REVIEW_DISPOSITION = "Needs review";
// AI by Zapier model tier. Prompt-only, so no tool-capable model is needed.
export const MODEL_ID = "standard/auto";
