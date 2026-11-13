// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const COMPLIANCE_FOLDER = "REPLACE_COMPLIANCE_FOLDER"; // Ask the user which Drive folder holds the packets ("root" = top level of My Drive), then look up its ID with their Google Docs connection.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel the reviewers read, then look up its ID (C…) with their Slack connection.
export const LLC_TEMPLATE_ID = "REPLACE_LLC_TEMPLATE_ID"; // Ask the user which Google Doc is the template for LLC funds, then look up its ID with their Google Docs connection.
export const LP_TEMPLATE_ID = "REPLACE_LP_TEMPLATE_ID"; // Ask the user which Google Doc is the template for limited partnership funds, then look up its ID with their Google Docs connection.
export const REVIEWER_MENTION = "REPLACE_REVIEWER_MENTION"; // Ask the user for the Slack user group to mention, in the form <!subteam^S…>. Used only when MENTION_REVIEWERS is true in workflow.ts.

// Sharing for the new packet: "reader" = anyone with the link can view.
export const SHARING_PREFERENCE = "reader";
