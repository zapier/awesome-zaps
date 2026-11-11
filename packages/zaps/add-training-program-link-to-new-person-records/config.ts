import { ask } from "zap-pack";

export const TRAINING_TABLE_ID = ask(
  "Zapier Tables table ID that holds the training programs (the long ID in the table's URL).",
);
// Table field key for the program key to match exactly (f1 = first column).
export const PROGRAM_KEY_FIELD = "f1";
// Table field key for the program link to copy (f2 = second column).
export const PROGRAM_LINK_FIELD = "f2";
export const PERSON_TRAINING_FIELD = ask(
  "Pipedrive custom field key on the person that holds the training/program reference.",
);
export const PERSON_LINK_FIELD = ask(
  "Pipedrive custom field key on the person that receives the program link.",
);
