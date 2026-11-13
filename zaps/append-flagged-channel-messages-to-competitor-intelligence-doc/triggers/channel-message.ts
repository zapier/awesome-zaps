// What starts the zap: a new message in the watched Slack channel.
export default {
  app: "slack",
  event: "channel_message",
  connection: "slack",
  params: {
    // Ask the user which channel to watch, then look up its ID (C…) with their Slack connection. Must match WATCHED_CHANNEL in config.ts.
    channel: "REPLACE_WATCHED_CHANNEL",
    // Sends the message text unformatted, and skips posts from bots.
    raw: "yes",
    listen_for_bots: "no",
  },
};
