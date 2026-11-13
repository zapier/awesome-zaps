// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which Zapier Tables table holds the valuation records, then look up its ID with their Zapier Tables connection.
export const TEMPLATE_DOC_ID = "REPLACE_TEMPLATE_DOC_ID"; // Ask the user which Google Doc is the valuation template, then look up its ID with their Google Docs connection. The long ID is in its URL.
export const FOLDER_ID = "REPLACE_FOLDER_ID"; // Ask the user which Drive folder gets the reports, then look up its ID with their Google Docs connection. "root" puts them at the top level of My Drive.

// Who can open the new report by link: "org_link_edit" means anyone at your organization with the link can edit.
export const SHARING_PREFERENCE = "org_link_edit";
