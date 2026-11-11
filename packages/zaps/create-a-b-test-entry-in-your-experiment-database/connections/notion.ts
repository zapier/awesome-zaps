import { connection } from "zap-pack";

export default connection({
  app: "notion",
  description:
    "The Notion account whose workspace has the experiment database, with the database shared to that integration",
});
