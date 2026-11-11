import { connection } from "zap-pack";

export default connection({
  app: "microsoft-outlook",
  description:
    "The user's Outlook connection, used for the trigger and the send step",
});
