import { connection } from "zap-pack";

export default connection({
  app: "personio",
  description:
    "The user's Personio connection, with API access to employee attributes, used by the trigger",
});
