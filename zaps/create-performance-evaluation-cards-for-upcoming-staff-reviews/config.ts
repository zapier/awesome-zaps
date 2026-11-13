// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const EMPLOYEES_TABLE_ID = "REPLACE_EMPLOYEES_TABLE_ID"; // Ask the user which Zapier Table holds the employees, then look up its ID with their Zapier Tables connection. The table needs Employee ID, First Name, Last Name, Evaluation Date, Supervisor ID and Trello Member ID columns.
export const TRELLO_BOARD_ID = "REPLACE_TRELLO_BOARD_ID"; // Ask the user which Trello board gets the review cards, then look up its ID with their Trello connection.
export const TRELLO_LIST_ID = "REPLACE_TRELLO_LIST_ID"; // Ask the user which list on that board gets the cards (usually "Due Soon"), then look up its ID with their Trello connection.
export const EVALUATION_FORM_URL = "REPLACE_EVALUATION_FORM_URL"; // Ask the user for the evaluation form's base URL; each card's checklist links to it with the employee ID appended.

// Name of the checklist added to each card.
export const CHECKLIST_NAME = "To Complete";
