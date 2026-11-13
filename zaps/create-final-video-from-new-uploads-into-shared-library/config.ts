// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const RENDER_REQUEST_URL = "REPLACE_RENDER_REQUEST_URL"; // Ask the user for the render service's endpoint for new render jobs, which takes a JSON POST.
export const LIBRARY_FOLDER_ID = "REPLACE_LIBRARY_FOLDER_ID"; // Ask the user which Google Drive folder is the shared library, then look up its ID with their Google Drive connection. Finished MP4s are saved here.

// Render status endpoint (GET); "{id}" is replaced with the render ID the POST returned.
export const RENDER_STATUS_URL = "REPLACE_RENDER_STATUS_URL"; // Ask the user for the render service's status endpoint (GET), with "{id}" where the render ID goes.
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
