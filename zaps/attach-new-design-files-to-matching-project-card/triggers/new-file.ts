// What starts the zap: a new file in the Dropbox folder that holds the design files.
export default {
  app: "dropbox",
  event: "new_file",
  connection: "dropbox",
  params: {
    // Ask the user which Dropbox folder holds the design files, then look up its path with their Dropbox connection. Must match DROPBOX_FOLDER in config.ts.
    directory: "REPLACE_DROPBOX_FOLDER",
  },
};
