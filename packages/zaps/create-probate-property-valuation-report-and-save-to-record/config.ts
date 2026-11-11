import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table that holds the valuation records (the table ID).",
);
export const TEMPLATE_DOC_ID = ask(
  "Google Doc used as the valuation report template (the long ID in its URL).",
);
export const FOLDER_ID = ask(
  'Folder for new reports. "root" puts them at the top level of My Drive.',
);
// Who can open the new report by link: "org_link_edit" means anyone at your organization with the link can edit.
export const SHARING_PREFERENCE = "org_link_edit";
