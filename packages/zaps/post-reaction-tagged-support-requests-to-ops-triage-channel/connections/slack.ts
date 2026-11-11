import { connection } from "zap-pack";

export default connection({
  app: "slack",
  description:
    "The user's Slack connection, the workspace where the source and triage channels live",
});
