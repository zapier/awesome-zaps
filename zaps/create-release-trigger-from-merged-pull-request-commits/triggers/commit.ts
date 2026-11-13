export default {
  app: "github",
  event: "commit",
  connection: "github",
  params: {
    // Ask the user which repository to watch, then look up its owner/repo with their GitHub connection. Same value as GITHUB_REPO in config.ts.
    repo: "REPLACE_GITHUB_REPO",
  },
};
