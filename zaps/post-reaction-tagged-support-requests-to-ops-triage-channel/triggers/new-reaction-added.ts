export default {
  app: "slack",
  event: "new_reaction_added_v3",
  connection: "slack",
  params: {
    conversation: "REPLACE_SOURCE_CHANNEL",
    emoji: "ticket",
    message_detail: "content",
    enrichments: ["permalink"],
  },
};
