import { ask } from "zap-pack";

export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID holding the user stories and the output tab (the long ID in the sheet's URL).",
);
// Worksheet (tab) holding the user stories; the first tab is "0".
export const STORIES_WORKSHEET_ID = "0";
export const OUTPUT_WORKSHEET_ID = ask(
  "Worksheet (tab) that receives the generated test cases and scripts.",
);
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
