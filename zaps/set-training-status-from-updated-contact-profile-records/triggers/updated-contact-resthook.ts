// What starts the zap: a HubSpot contact's property changes. workflow.ts skips any property other than the training one.
export default {
  app: "hubspot",
  event: "updated_contact_resthook_v3",
  connection: "hubspot",
  params: {
    // Ask the user which HubSpot contact property holds the training status, then look up its internal name with their HubSpot connection. Same value as TRAINING_PROPERTY in config.ts.
    property_name: "REPLACE_TRAINING_PROPERTY",
  },
};
