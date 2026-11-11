import { ask } from "zap-pack";

export const TOPIC_QUERY = ask(
  "Search string the YouTube trigger watches for new uploads (your topic).",
);
export const TITLE_KEYWORD = ask(
  "Keyword a video title must contain to be kept (case-insensitive).",
);
export const TABLE_ID = ask(
  "Zapier Tables table ID of the content database that receives rows.",
);
