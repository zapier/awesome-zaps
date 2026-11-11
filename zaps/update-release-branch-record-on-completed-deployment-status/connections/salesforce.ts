import { connection } from "zap-pack";

export default connection({
  app: "salesforce",
  description:
    "A Salesforce connection for the org that holds the metadata log and branch objects",
});
