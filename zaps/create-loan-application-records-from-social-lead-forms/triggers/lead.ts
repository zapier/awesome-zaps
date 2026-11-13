export default {
  app: "facebook-lead-ads",
  event: "lead",
  connection: "facebook-lead-ads",
  params: {
    // Ask the user which Facebook Page has the lead form, then look up its ID with their Facebook Lead Ads connection.
    page: "REPLACE_FACEBOOK_PAGE_ID",
    // Ask the user which lead form starts the Zap, then look up its ID with their Facebook Lead Ads connection. Delete this line to take any form on the page.
    form: "REPLACE_FACEBOOK_LEAD_FORM_ID",
  },
};
