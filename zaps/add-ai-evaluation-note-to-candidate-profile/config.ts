// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const JOB_ID = "REPLACE_JOB_ID"; // Look up with the user's Greenhouse connection and confirm: the job to screen (the number in the job's URL). Other jobs are skipped.
export const JOB_NAME = "REPLACE_JOB_NAME"; // Look up from the job in JOB_ID: its name as shown in Greenhouse, written to the tracker row.
export const NOTE_AUTHOR_USER_ID = "REPLACE_NOTE_AUTHOR_USER_ID"; // Ask the user whose name goes on the note, then look up that Greenhouse user's ID (required for auditing).
export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the hiring tracker, then look up its ID with their Google Sheets connection.

// What a strong candidate for this job looks like. The AI scores against this and nothing else.
export const ROLE_CRITERIA = `Experience gate: at least 3 years as a product manager, with at least one role owning a payroll, HR, finance or compliance product.
Depth: how much hands-on ownership the resume shows (shipped features, owned roadmaps, worked with engineering and design).
Product thinking: how well the application answers explain user problems, trade-offs and how success was measured.`;
// Note visibility: "private" keeps it to people who can see private notes, so interviewers are not primed by it.
export const NOTE_VISIBILITY = "private";
// Worksheet (tab) ID; the first tab is "0". Columns A to F: application ID, overall assessment, job,
// application link, key answer excerpts, submitted at.
export const WORKSHEET_ID = "0";
// AI by Zapier model tier. Prompt-only, so no tool-capable model is needed.
export const MODEL_ID = "standard/auto";
