// What starts the zap: new Gmail emails that match the search below.
export default {
  app: "gmail",
  event: "search",
  connection: "gmail",
  params: {
    // Ask the user which Gmail search finds the vendor's code emails, such as from:<sender> subject:"<subject>", then use it as is. Use the same sender as VENDOR_SENDER.
    query: "REPLACE_GMAIL_SEARCH",
  },
};
