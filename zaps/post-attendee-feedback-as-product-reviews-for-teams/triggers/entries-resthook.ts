export default {
  app: "typeform",
  event: "entries_resthook_v2",
  connection: "typeform",
  params: {
    // Ask the user which Typeform form collects attendee feedback, then look up its ID with their Typeform connection.
    formId: "REPLACE_FORM_ID",
  },
};
