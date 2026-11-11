import { connection } from "zap-pack";

export default connection({
  app: "google-calendar",
  description:
    "The user's Google Calendar connection, for the account that owns the rotation calendar and can edit its events",
});
