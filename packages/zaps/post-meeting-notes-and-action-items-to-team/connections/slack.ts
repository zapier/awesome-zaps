import { connection } from "zap-pack";

export default connection({
  app: "slack",
  description:
    "The Slack account in your workspace that can post to the channel",
});
