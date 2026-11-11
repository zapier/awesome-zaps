import { ask } from "zap-pack";

export const NOTION_DATA_SOURCE_ID = ask(
  'Notion data source (database) that holds the design records. Find it in the database\'s "..." menu, or from its URL.',
);
// Title property on the design records. The uploaded file's name, without its extension, must match this.
export const NOTION_TITLE_PROPERTY = "Name";
// URL property on the design record that receives the Dropbox share link.
export const NOTION_DOWNLOAD_URL_PROPERTY = "Download URL";
