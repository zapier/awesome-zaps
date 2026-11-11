import { connection } from "zap-pack";

export default connection({
  app: "google-drive",
  description:
    "The user's Google Drive connection, for the account that owns the staging folder",
});
