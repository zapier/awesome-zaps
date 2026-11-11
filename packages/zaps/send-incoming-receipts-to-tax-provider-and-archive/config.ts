import { ask } from "zap-pack";

export const INTAKE_FOLDER_ID = ask(
  "Google Drive folder ID where receipts land. Also set it as the folder on the trigger.",
);
export const PROCESSED_FOLDER_ID = ask(
  "Google Drive folder ID that originals are moved into after the delay.",
);
export const TAX_UPLOAD_ADDRESS = ask(
  "Email address of the tax provider's upload inbox. Receives each receipt.",
);
export const SENDER_ADDRESS = ask(
  "Sender address. Must be the connected Gmail account.",
);
// Subject line. {filename} is replaced with the receipt's file name.
export const SUBJECT_TEMPLATE = "Receipt: {filename}";
// Body text of the email.
export const BODY_TEXT = "Attached is a new receipt for the tax file.";
