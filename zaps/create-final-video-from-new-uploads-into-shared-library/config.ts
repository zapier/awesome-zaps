import { ask } from "zap-pack";

export const RENDER_REQUEST_URL = ask(
  "Render service endpoint that accepts a JSON render request (POST).",
);
// Render status endpoint (GET); "{id}" is replaced with the render ID the POST returned.
export const RENDER_STATUS_URL = "YOUR_RENDER_STATUS_URL/{id}";
// Field in the POST response that holds the render ID (dot path for nested fields).
export const RENDER_ID_FIELD = "id";
// Field in the status response that holds the render status.
export const STATUS_FIELD = "status";
// Field in the status response that holds the finished MP4's download URL.
export const DOWNLOAD_URL_FIELD = "download_url";
// Avatar sent with every render request.
export const DEFAULT_AVATAR = "default";
// Voice sent with every render request.
export const DEFAULT_VOICE = "default";
// Aspect ratio sent with every render request.
export const DEFAULT_ASPECT_RATIO = "16:9";
export const LIBRARY_FOLDER_ID = ask(
  "Google Drive folder ID of the shared library that receives finished MP4s.",
);
