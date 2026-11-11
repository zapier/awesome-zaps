import { ask } from "zap-pack";

export const AIRTABLE_BASE_ID = ask(
  'Airtable base ID (starts with "app"), from the base\'s URL or API docs.',
);
export const AIRTABLE_TABLE_NAME = ask("Table that holds consent records.");
// Airtable field that receives the normalized sender number (E.164).
export const PHONE_FIELD = "Phone";
// Airtable field that receives the name parsed from the reply, if any.
export const NAME_FIELD = "Name";
// Airtable field that receives the raw reply text.
export const NOTES_FIELD = "Notes";
// Airtable checkbox field set to true for every consent record created.
export const OPT_IN_FIELD = "Opted in";
// Airtable field that receives the submission identifier from the payload.
export const SUBMISSION_ID_FIELD = "Submission ID";
// Country code added to 10-digit numbers that were sent without a "+".
export const DEFAULT_COUNTRY_CODE = "+1";
