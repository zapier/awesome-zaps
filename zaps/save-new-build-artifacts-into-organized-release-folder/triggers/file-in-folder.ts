// What starts the zap: a new file directly in the source folder.
export default {
  app: "google-drive",
  event: "file_in_folder_v2",
  connection: "google-drive",
  params: {
    // Ask the user which Drive folder receives the build artifacts, then look up its ID with their Google Drive connection. Same value as SOURCE_FOLDER_ID in config.ts.
    folder: "REPLACE_SOURCE_FOLDER_ID",
    // Subfolders are not watched.
    includeSubfolders: false,
    // Deleted files do not start the zap.
    includeDeleted: "false",
  },
};
