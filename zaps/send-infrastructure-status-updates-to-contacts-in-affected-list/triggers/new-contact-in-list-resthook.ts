// What starts the zap: a contact added to the affected-contacts list in HubSpot.
export default {
  app: "hubspot",
  event: "new_contact_in_list_resthook_v3",
  connection: "hubspot",
  params: {
    // Ask the user which HubSpot list holds the affected contacts, then look up its ID with their HubSpot connection.
    list_id: "REPLACE_LIST_ID",
  },
};
