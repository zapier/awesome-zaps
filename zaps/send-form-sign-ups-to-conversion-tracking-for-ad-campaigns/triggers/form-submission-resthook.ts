// What starts the zap: each new submission of one HubSpot form.
export default {
  app: "hubspot",
  event: "form_submission_resthook_v3",
  connection: "hubspot",
  params: {
    // Ask the user which HubSpot form feeds the conversions, then look up its ID with their HubSpot connection.
    form_guid: "REPLACE_HUBSPOT_FORM_GUID",
  },
};
