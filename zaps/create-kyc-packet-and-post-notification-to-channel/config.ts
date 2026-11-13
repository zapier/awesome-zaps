// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const COMPLIANCE_FOLDER = "REPLACE_COMPLIANCE_FOLDER"; // Google Drive folder ID for new packets ("root" = top level of My Drive).
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Slack channel ID to post the notification to.

// Sharing for the new packet: "reader" = anyone with the link can view.
export const SHARING_PREFERENCE = "reader";
// Slack user-group mention for the reviewers; used only when MENTION_REVIEWERS is true.
export const REVIEWER_MENTION = "<!subteam^YOUR_USERGROUP_ID>";
