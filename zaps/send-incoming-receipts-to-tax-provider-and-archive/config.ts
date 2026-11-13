// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const INTAKE_FOLDER_ID = "REPLACE_INTAKE_FOLDER_ID"; // Google Drive folder ID where receipts land. Also set it as the folder on the trigger.
export const PROCESSED_FOLDER_ID = "REPLACE_PROCESSED_FOLDER_ID"; // Google Drive folder ID that originals are moved into after the delay.
export const TAX_UPLOAD_ADDRESS = "REPLACE_TAX_UPLOAD_ADDRESS"; // Email address of the tax provider's upload inbox. Receives each receipt.
export const SENDER_ADDRESS = "REPLACE_SENDER_ADDRESS"; // Sender address. Must be the connected Gmail account.

// Subject line. {filename} is replaced with the receipt's file name.
export const SUBJECT_TEMPLATE = "Receipt: {filename}";
// Body text of the email.
export const BODY_TEXT = "Attached is a new receipt for the tax file.";
