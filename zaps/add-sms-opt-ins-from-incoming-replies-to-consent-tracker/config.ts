// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const AIRTABLE_BASE_ID = "REPLACE_AIRTABLE_BASE_ID"; // Ask the user which Airtable base holds consent records, then look up its ID (app…) with their Airtable connection.
export const AIRTABLE_TABLE_NAME = "REPLACE_AIRTABLE_TABLE_NAME"; // Ask the user which table in that base holds consent records, then look up its name with their Airtable connection.

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
