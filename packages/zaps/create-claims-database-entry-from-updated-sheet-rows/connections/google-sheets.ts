import { connection } from "zap-pack";

export default connection({
  app: "google-sheets",
  description:
    "The user's Google Sheets connection, for the account that owns the claims sheet",
});
