// What starts the zap: a deploy reaction on a message in the deploy channel.
export default {
  app: "slack",
  event: "new_reaction_added_v3",
  connection: "slack",
  params: {
    // Must equal DEPLOY_REACTION in config.ts.
    emoji: "rocket",
    // Ask the user which channel deploy messages go to, then look up its ID (C…) with their Slack connection.
    conversation: "REPLACE_DEPLOY_CHANNEL_ID",
    // Without a message detail level the trigger doesn't fetch the message text.
    message_detail: "readable",
  },
};
