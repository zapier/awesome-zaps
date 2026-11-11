import { ask } from "zap-pack";

export const EMPLOYEES_TABLE_ID = ask(
  "Zapier Tables table ID of the employees table (the long ID in the table's URL). Needs Employee ID, First Name, Last Name, Evaluation Date, Supervisor ID and Trello Member ID columns.",
);
export const TRELLO_BOARD_ID = ask(
  "Trello board ID that review cards are created on.",
);
export const TRELLO_LIST_ID = ask(
  "Trello list ID of the 'Due Soon' list on that board.",
);
export const EVALUATION_FORM_URL = ask(
  "Evaluation form URL; each card's checklist links to it with the employee ID appended.",
);
// Name of the checklist added to each card.
export const CHECKLIST_NAME = "To Complete";
