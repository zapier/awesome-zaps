import { ask } from "zap-pack";

export const WATCHED_CHANNEL = ask(
  'Slack channel ID to watch, from the channel\'s details (e.g. "C02M7813E").',
);
// Slack workspace URL, used to build each message's permalink.
export const SLACK_WORKSPACE_URL = "https://YOUR_WORKSPACE.slack.com";
// Title of the central competitor intelligence document. Created if no document has this title.
export const INTEL_DOC_TITLE = "Competitor intelligence";
