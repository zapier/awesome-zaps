// What starts the zap: a new file in the incoming Google Drive folder.
export default {
  app: "google-drive",
  event: "file_in_folder_v2",
  connection: "google-drive",
  params: {
    // Ask the user which Google Drive folder receives uploads, then look up its ID with their Google Drive connection.
    folder: "REPLACE_INCOMING_FOLDER_ID",
    includeDeleted: "false",
  },
};
