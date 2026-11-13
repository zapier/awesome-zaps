// What starts the zap: a new file in the render folder. The workflow reads only its name, path and share link.
export default {
  app: "dropbox",
  event: "new_file",
  connection: "dropbox",
  params: {
    // Ask the user which Dropbox folder holds the renders, as a path from the Dropbox root, such as /Renders.
    directory: "REPLACE_RENDER_FOLDER",
    recursive: false,
    // Set to "no" so large renders do not fail the run. The workflow does not read file contents.
    include_file_contents: "no",
    // The share link arrives in the trigger's share_link field.
    include_sharing_link: "yes",
    sharing_link_audience: "public",
  },
};
