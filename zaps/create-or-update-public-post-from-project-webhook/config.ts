// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TRACKING_TABLE_ID = "REPLACE_TRACKING_TABLE_ID"; // Zapier Tables table that tracks each project's public post.
export const CMS_DEFAULT_CATEGORY = "REPLACE_CMS_DEFAULT_CATEGORY"; // Category every post is published under.
export const DISCORD_CHANNEL_ID = "REPLACE_DISCORD_CHANNEL_ID"; // Discord channel that gets the team summary.

// Table field key that holds the project reference (used to find the row).
export const REFERENCE_FIELD = "new__data__f1";
// Table field key that stores the CMS post ID.
export const POST_ID_FIELD = "new__data__f2";
// Table field key that stores the publish status.
export const STATUS_FIELD = "new__data__f3";
// CMS posts endpoint. A POST creates a post; a PATCH to `${CMS_POSTS_URL}/<id>` updates one.
export const CMS_POSTS_URL = "https://YOUR_CMS_HOST/api/posts";
