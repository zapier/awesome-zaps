// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const EMPLOYEES_TABLE_ID = "REPLACE_EMPLOYEES_TABLE_ID"; // Zapier Tables table ID of the employees table (the long ID in the table's URL). Needs Employee ID, First Name, Last Name, Evaluation Date, Supervisor ID and Trello Member ID columns.
export const TRELLO_BOARD_ID = "REPLACE_TRELLO_BOARD_ID"; // Trello board ID that review cards are created on.
export const TRELLO_LIST_ID = "REPLACE_TRELLO_LIST_ID"; // Trello list ID of the 'Due Soon' list on that board.
export const EVALUATION_FORM_URL = "REPLACE_EVALUATION_FORM_URL"; // Evaluation form URL; each card's checklist links to it with the employee ID appended.

// Name of the checklist added to each card.
export const CHECKLIST_NAME = "To Complete";
