import { ask } from "zap-pack";

export const SLACK_CHANNEL = ask(
  'Slack channel ID to post the status summary to (the ID, not the name, e.g. "C0123456").',
);
// Status value that counts as a finished run. A post also happens whenever error_count is above zero.
export const COMPLETED_STATUS = "completed";
