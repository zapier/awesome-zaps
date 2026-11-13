// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SUB_ZAP_URL = "REPLACE_SUB_ZAP_URL"; // Ask the user for the webhook URL of the sub-zap that receives each merged pull request commit.
export const GITHUB_REPO = "REPLACE_GITHUB_REPO"; // Ask the user which repository to watch, then look up its owner/repo with their GitHub connection. Same value as repo in triggers/commit.ts.
