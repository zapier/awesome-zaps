// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRAINING_TABLE_ID = "REPLACE_TRAINING_TABLE_ID"; // Ask the user which Zapier Table holds the training programs, then look up its ID with their Zapier Tables connection. It is the long ID in the table's URL.
export const PERSON_TRAINING_FIELD = "REPLACE_PERSON_TRAINING_FIELD"; // Ask the user which Pipedrive custom field holds the training or program reference, then look up its key with their Pipedrive connection.
export const PERSON_LINK_FIELD = "REPLACE_PERSON_LINK_FIELD"; // Ask the user which Pipedrive custom field receives the program link, then look up its key with their Pipedrive connection.

// Table field key for the program key to match exactly (f1 = first column).
export const PROGRAM_KEY_FIELD = "f1";
// Table field key for the program link to copy (f2 = second column).
export const PROGRAM_LINK_FIELD = "f2";
