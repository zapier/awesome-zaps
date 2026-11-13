export default {
  app: "google-drive",
  event: "file_in_folder_v2",
  connection: "google-drive",
  params: {
    // Ask the user which Google Drive folder receives the word-list documents, then look up its ID (from its URL) with their Google Drive connection. Same value as WATCHED_FOLDER_ID in config.ts.
    folder: "REPLACE_WATCHED_FOLDER_ID",
  },
};
