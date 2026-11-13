// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which spreadsheet holds the user stories and the output tab, then look up its ID with their Google Sheets connection (the long ID in the sheet's URL).
export const OUTPUT_WORKSHEET_ID = "REPLACE_OUTPUT_WORKSHEET_ID"; // Look up with the user's Google Sheets connection the tab that receives the generated test cases and scripts, then use its ID (gid).

// Worksheet (tab) holding the user stories; the first tab is "0".
export const STORIES_WORKSHEET_ID = "0";
// Story columns on the stories tab (COL$A = column A).
export const STORY_ID_COLUMN = "COL$A";
export const STORY_DESCRIPTION_COLUMN = "COL$B";
// Output columns on the output tab.
export const OUTPUT_ID_COLUMN = "COL$A";
export const OUTPUT_TEST_IDS_COLUMN = "COL$B";
export const OUTPUT_SUMMARY_COLUMN = "COL$C";
export const OUTPUT_SCRIPT_COLUMN = "COL$D";
// ChatGPT model used for the test-case and script prompts.
export const CHATGPT_MODEL = "gpt-3.5-turbo-instruct";
