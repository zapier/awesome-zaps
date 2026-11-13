// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Zapier Tables table that holds the valuation records (the table ID).
export const TEMPLATE_DOC_ID = "REPLACE_TEMPLATE_DOC_ID"; // Google Doc used as the valuation report template (the long ID in its URL).
export const FOLDER_ID = "REPLACE_FOLDER_ID"; // Folder for new reports. "root" puts them at the top level of My Drive.

// Who can open the new report by link: "org_link_edit" means anyone at your organization with the link can edit.
export const SHARING_PREFERENCE = "org_link_edit";
