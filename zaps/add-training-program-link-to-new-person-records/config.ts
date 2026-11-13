// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRAINING_TABLE_ID = "REPLACE_TRAINING_TABLE_ID"; // Zapier Tables table ID that holds the training programs (the long ID in the table's URL).
export const PERSON_TRAINING_FIELD = "REPLACE_PERSON_TRAINING_FIELD"; // Pipedrive custom field key on the person that holds the training/program reference.
export const PERSON_LINK_FIELD = "REPLACE_PERSON_LINK_FIELD"; // Pipedrive custom field key on the person that receives the program link.

// Table field key for the program key to match exactly (f1 = first column).
export const PROGRAM_KEY_FIELD = "f1";
// Table field key for the program link to copy (f2 = second column).
export const PROGRAM_LINK_FIELD = "f2";
