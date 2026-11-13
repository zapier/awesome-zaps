// What starts the zap: a :ticket: reaction on a message in the watched channel.
export default {
  app: "slack",
  event: "new_reaction_added_v3",
  connection: "slack",
  params: {
    emoji: "ticket",
    // Ask the user which channel to watch, then look up its ID (C…) with their Slack connection.
    // Must differ from SLACK_CHANNEL_ID, or a :ticket: on a triage post posts it again.
    conversation: "REPLACE_WATCHED_CHANNEL_ID",
    // Without a message detail level the trigger sends no message text.
    message_detail: "content",
    enrichments: ["permalink"],
  },
};
