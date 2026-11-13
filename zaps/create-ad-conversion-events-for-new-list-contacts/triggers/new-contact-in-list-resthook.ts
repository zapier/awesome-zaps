// What starts the zap: a contact added to the HubSpot list in config.ts's HUBSPOT_LIST_ID.
export default {
  app: "hubspot",
  event: "new_contact_in_list_resthook_v3",
  connection: "hubspot",
  params: {
    // Ask the user which HubSpot list creates conversion events, then look up its ID with their HubSpot connection. Same list as HUBSPOT_LIST_ID in config.ts.
    list_id: "REPLACE_HUBSPOT_LIST_ID",
    // The contact fields workflow.ts reads.
    properties_to_retrieve: ["email", "firstname", "lastname", "company"],
  },
};
