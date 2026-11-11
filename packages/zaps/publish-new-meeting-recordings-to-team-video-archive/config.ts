import { ask } from "zap-pack";

export const AIRTABLE_BASE_ID = ask(
  'Airtable base ID (the "app..." ID in the base\'s URL).',
);
export const AIRTABLE_TABLE = ask(
  "Airtable table that holds the video archive.",
);
export const GUID_FIELD = ask(
  "Column that stores the Zoom recording GUID; existing rows are matched on it.",
);
export const TITLE_FIELD = ask("Column for the recording title.");
export const VIDEO_URL_FIELD = ask("Column for the Vimeo video link.");
export const DATE_FIELD = ask("Column for the meeting start date.");
// Vimeo privacy for uploads: "unlisted" keeps videos off public listings.
export const VIMEO_PRIVACY = "unlisted";
