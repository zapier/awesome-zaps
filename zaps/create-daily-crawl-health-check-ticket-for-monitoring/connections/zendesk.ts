import { connection } from "zap-pack";

export default connection({
  app: "zendesk",
  description:
    "The user's Zendesk connection, for the account that owns the monitoring queue",
});
