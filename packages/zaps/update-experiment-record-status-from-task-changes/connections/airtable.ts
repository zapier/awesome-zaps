import { connection } from "zap-pack";

export default connection({
  app: "airtable",
  description:
    "The user's Airtable connection, for the base that holds the experiments table",
});
