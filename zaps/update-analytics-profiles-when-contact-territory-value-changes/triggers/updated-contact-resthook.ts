// What starts the zap: a change to the territory property on a HubSpot contact.
export default {
  app: "hubspot",
  event: "updated_contact_resthook_v3",
  connection: "hubspot",
  params: {
    // Look up with the user's HubSpot connection the internal name of the territory property. Must match TERRITORY_PROPERTY in config.ts.
    property_name: "REPLACE_TERRITORY_PROPERTY",
  },
};
