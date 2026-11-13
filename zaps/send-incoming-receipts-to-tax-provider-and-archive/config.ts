// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INTAKE_FOLDER_ID = "REPLACE_INTAKE_FOLDER_ID"; // Ask the user which Drive folder receipts land in, then look up its ID with their Google Drive connection. Also set it as the folder on the trigger.
export const PROCESSED_FOLDER_ID = "REPLACE_PROCESSED_FOLDER_ID"; // Ask the user which Drive folder originals are moved into, then look up its ID with their Google Drive connection. Files move here after the delay.
export const TAX_UPLOAD_ADDRESS = "REPLACE_TAX_UPLOAD_ADDRESS"; // Ask the user for their tax provider's upload inbox address. Each receipt is emailed here.
export const SENDER_ADDRESS = "REPLACE_SENDER_ADDRESS"; // Look up with the user's Gmail connection: the address of the account that sends the email. Must be the connected Gmail account.

// Subject line. {filename} is replaced with the receipt's file name.
export const SUBJECT_TEMPLATE = "Receipt: {filename}";
// Body text of the email.
export const BODY_TEXT = "Attached is a new receipt for the tax file.";
