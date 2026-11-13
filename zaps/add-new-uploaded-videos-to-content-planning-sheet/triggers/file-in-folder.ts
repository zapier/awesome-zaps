export default {
  app: "google-drive",
  event: "file_in_folder_v2",
  connection: "google-drive",
  params: {
    // Ask the user which Drive folder is the staging folder, then look up its ID with their Google Drive connection. Same value as STAGING_FOLDER_ID in config.ts.
    folder: "REPLACE_STAGING_FOLDER_ID",
    // Subfolders are not searched.
    includeSubfolders: false,
    // Deleted files are not logged.
    includeDeleted: "false",
  },
};
