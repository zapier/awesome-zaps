import { connection } from "zap-pack";

export default connection({
  app: "ashby",
  description:
    "The user's Ashby connection, an API key allowed to read candidates, jobs and offers, used by the trigger",
});
