import { connection } from "zap-pack";

export default connection({
  app: "slack",
  description:
    "The user's Slack connection for the workspace with the deploy channel",
});
