import { ask } from "zap-pack";

export const COMPLIANCE_FOLDER = ask(
  'Google Drive folder ID for new packets ("root" = top level of My Drive).',
);
export const SLACK_CHANNEL = ask(
  "Slack channel ID to post the notification to.",
);
// Sharing for the new packet: "reader" = anyone with the link can view.
export const SHARING_PREFERENCE = "reader";
// Slack user-group mention for the reviewers; used only when MENTION_REVIEWERS is true.
export const REVIEWER_MENTION = "<!subteam^YOUR_USERGROUP_ID>";
