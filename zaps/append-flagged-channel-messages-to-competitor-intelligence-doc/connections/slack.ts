// The account this zap uses as "slack"; workflow.ts and triggers/ refer to it by that alias.
export default {
  app: "slack",
  description:
    "The Slack connection for the workspace with the channel to watch, which can read that channel",
};
