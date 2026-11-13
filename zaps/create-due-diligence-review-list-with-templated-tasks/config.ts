// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TEAM_ID = "REPLACE_TEAM_ID"; // Ask the user which ClickUp workspace holds the review lists, then look up its team ID with their ClickUp connection.
export const SPACE_ID = "REPLACE_SPACE_ID"; // Ask the user which ClickUp space the review lists are created in, then look up its ID with their ClickUp connection.
export const TEMPLATE_ID = "REPLACE_TEMPLATE_ID"; // Ask the user which list template holds the due-diligence tasks, then look up its ID with their ClickUp connection.
export const COUNTERPARTY_FIELD_ID = "REPLACE_COUNTERPARTY_FIELD_ID"; // Ask the user which ClickUp custom field holds the counterparty, then look up its ID with their ClickUp connection.
export const CONTACT_NAME_FIELD_ID = "REPLACE_CONTACT_NAME_FIELD_ID"; // Ask the user which ClickUp custom field holds the contact name, then look up its ID with their ClickUp connection.
export const CONTACT_EMAIL_FIELD_ID = "REPLACE_CONTACT_EMAIL_FIELD_ID"; // Ask the user which ClickUp custom field holds the contact email, then look up its ID with their ClickUp connection.
export const ADDRESS_FIELD_ID = "REPLACE_ADDRESS_FIELD_ID"; // Ask the user which ClickUp custom field holds the address, then look up its ID with their ClickUp connection.
export const INVOICE_NUMBER_FIELD_ID = "REPLACE_INVOICE_NUMBER_FIELD_ID"; // Ask the user which ClickUp custom field holds the invoice number, then look up its ID with their ClickUp connection.

// Tasks whose name contains this text get the document due date; all others get the review due date.
export const DOCUMENT_TASK_MATCH = "document";
