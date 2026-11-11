import { ask } from "zap-pack";

export const DRIVE_FOLDER_ID = ask(
  "Google Drive folder ID where each raw cXML file is saved (the long ID in the folder's URL). Needs a Google Drive connection.",
);
export const TABLE_ID = ask(
  "Zapier Tables table ID that holds one row per invoice or ASN.",
);
export const XERO_ORGANIZATION = ask(
  "Xero organization that invoice lookups run against (organization name or ID).",
);
export const ASN_TEMPLATE_ID = ask(
  "pdfFiller document ID of the ASN PDF template.",
);
