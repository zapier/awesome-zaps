import { ask } from "zap-pack";

export const SOURCE_FOLDER_ID = ask(
  "Google Drive folder ID holding the original images (the long ID in the folder's URL).",
);
export const DESTINATION_FOLDER_ID = ask(
  "Google Drive folder ID where the resized copies are written.",
);
// Suffix added before the file extension: photo.jpg becomes photo-1080x1080.jpg.
export const SIZE_SUFFIX = "-1080x1080";
// Only files whose MIME type starts with this prefix are processed.
export const MIME_PREFIX = "image/";
