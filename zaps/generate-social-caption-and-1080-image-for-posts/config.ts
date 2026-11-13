// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TABLE_ID = "REPLACE_TABLE_ID"; // Ask the user which table holds the content ideas, then look up its ID with their Zapier Tables connection. It is the long ID in the table's URL.

// Field key for the caption, written by the workflow.
export const CAPTION_FIELD = "new__data__f2";
// Field key for the hashtags, written by the workflow.
export const HASHTAGS_FIELD = "new__data__f3";
// Field key for the image URL, written only when the image field is empty.
export const IMAGE_FIELD = "new__data__f4";
// Field key for the stage, set to PUBLISH_READY_STAGE when the row is done.
export const STAGE_FIELD = "new__data__f5";
// Stage value that marks a row publish-ready. Rows already at this stage are skipped, so the workflow's own update does not loop.
export const PUBLISH_READY_STAGE = "Publish-ready";
// Style requested in the image prompt.
export const IMAGE_STYLE = "colorful";
// AI by Zapier model for the caption and hashtags.
export const CAPTION_MODEL = "standard/auto";
// Gemini model for the image.
export const IMAGE_MODEL = "gemini-2.5-flash-image-preview";
