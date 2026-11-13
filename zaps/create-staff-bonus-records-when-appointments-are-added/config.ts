// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const APPOINTMENT_STAFF_REF_FIELD =
  "REPLACE_APPOINTMENT_STAFF_REF_FIELD"; // Ask the user which appointment field names the staff member, then look up its API name with their Salesforce connection. Falls back to OwnerId when the appointment has none.
export const APPOINTMENT_TYPE_FIELD = "REPLACE_APPOINTMENT_TYPE_FIELD"; // Ask the user which appointment field holds the type that picks the bonus tier, then look up its API name with their Salesforce connection.
export const STAFF_OBJECT = "REPLACE_STAFF_OBJECT"; // Ask the user which object holds staff, then look up its API name with their Salesforce connection.
export const STAFF_MATCH_FIELD = "REPLACE_STAFF_MATCH_FIELD"; // Ask the user which staff field matches the appointment's staff reference, then look up its API name with their Salesforce connection.
export const TRANSACTION_OBJECT = "REPLACE_TRANSACTION_OBJECT"; // Ask the user which object holds Staff Account Transactions, then look up its API name with their Salesforce connection.
export const TX_CREATED_DATE_FIELD = "REPLACE_TX_CREATED_DATE_FIELD"; // Ask the user which transaction field holds the created date, then look up its API name with their Salesforce connection.
export const TX_STAFF_LOOKUP_FIELD = "REPLACE_TX_STAFF_LOOKUP_FIELD"; // Ask the user which transaction field links to the staff record, then look up its API name with their Salesforce connection.
export const TX_AMOUNT_FIELD = "REPLACE_TX_AMOUNT_FIELD"; // Ask the user which transaction field holds the bonus amount, then look up its API name with their Salesforce connection.
export const TX_MEMO_FIELD = "REPLACE_TX_MEMO_FIELD"; // Ask the user which transaction field holds the memo, then look up its API name with their Salesforce connection.
export const TX_CLASSIFICATION_FIELD = "REPLACE_TX_CLASSIFICATION_FIELD"; // Ask the user which transaction field holds the classification label, then look up its API name with their Salesforce connection.
export const TX_DETAIL_FIELD = "REPLACE_TX_DETAIL_FIELD"; // Ask the user which transaction field holds the detail label, then look up its API name with their Salesforce connection.

// Classification labels written on every bonus transaction.
export const TX_CLASSIFICATION_VALUE = "Credit";
export const TX_DETAIL_VALUE = "Appointment Bonus";
