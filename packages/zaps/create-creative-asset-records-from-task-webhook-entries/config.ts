import { ask } from "zap-pack";

export const REQUESTS_DATA_SOURCE = ask(
  "Notion data source (database) of creative requests. Share it with the connected Notion integration.",
);
export const ASSETS_DATA_SOURCE = ask(
  "Notion data source (database) of creative asset records.",
);
// Requests property that holds the task permalink URL, matched when looking for an existing request.
export const REQUEST_PERMALINK_PROPERTY = "Permalink";
// Requests title property, set when a new request is created.
export const REQUEST_TITLE_PROPERTY = "Name";
// Assets title property.
export const ASSET_TITLE_PROPERTY = "Name";
// Assets property that holds the asset URL.
export const ASSET_URL_PROPERTY = "URL";
// Assets relation property that links each record to its request.
export const ASSET_REQUEST_PROPERTY = "Request";
// Assets status property, and the value new records get.
export const ASSET_STATUS_PROPERTY = "Status";
export const ASSET_STATUS_NEW = "New";
// Base URL for asset links: `${ASSET_URL_BASE}/${boardId}/${assetId}`, or `${ASSET_URL_BASE}/${assetId}` without a board.
export const ASSET_URL_BASE = "https://YOUR_ASSET_HOST";
