// What starts the zap: a new Gmail email matching the search below. workflow.ts then filters by subject and recipient.
export default {
  app: "gmail",
  event: "search",
  connection: "gmail",
  params: {
    // Ask the user which Gmail search finds the report emails, in Gmail search syntax. config.ts uses the same value.
    query: "REPLACE_SEARCH_QUERY",
  },
};
