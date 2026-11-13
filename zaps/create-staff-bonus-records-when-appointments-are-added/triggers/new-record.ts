// What starts the zap: a new appointment record in Salesforce.
export default {
  app: "salesforce",
  event: "new_record",
  connection: "salesforce",
  params: {
    // Ask the user which Salesforce object holds appointments, then look up its API name with their Salesforce connection.
    object: "REPLACE_APPOINTMENT_OBJECT",
  },
};
