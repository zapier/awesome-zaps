import { connection } from "zap-pack";

export default connection({
  app: "salesforce",
  description:
    "The user's Salesforce connection, for the org that holds appointments, staff and transactions",
});
