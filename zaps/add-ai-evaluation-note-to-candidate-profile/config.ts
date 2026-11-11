import { ask } from "zap-pack";

export const JOB_ID = ask(
  "Greenhouse job ID to screen (the number in the job's URL). Applications for other jobs are skipped.",
);
// Job name written to the tracker row, since the trigger only carries the job's ID.
export const JOB_NAME = "Product Manager, Payroll";
// What a strong candidate for this job looks like. The AI scores against this and nothing else.
export const ROLE_CRITERIA = `Experience gate: at least 3 years as a product manager, with at least one role owning a payroll, HR, finance or compliance product.
Depth: how much hands-on ownership the resume shows (shipped features, owned roadmaps, worked with engineering and design).
Product thinking: how well the application answers explain user problems, trade-offs and how success was measured.`;
export const NOTE_AUTHOR_USER_ID = ask(
  "Greenhouse user ID the note is created on behalf of (Greenhouse requires one for auditing).",
);
// Note visibility: "private" keeps it to people who can see private notes, so interviewers are not primed by it.
export const NOTE_VISIBILITY = "private";
export const SPREADSHEET_ID = ask(
  "Google Sheets spreadsheet ID for the hiring tracker (the long ID in the sheet's URL).",
);
// Worksheet (tab) ID; the first tab is "0". Columns A to F: application ID, overall assessment, job,
// application link, key answer excerpts, submitted at.
export const WORKSHEET_ID = "0";
// AI by Zapier model tier. Prompt-only, so no tool-capable model is needed.
export const MODEL_ID = "standard/auto";
