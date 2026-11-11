import { connection } from "zap-pack";

export default connection({
  app: "google-drive",
  description:
    "The Google account that owns the project folder (trigger only; the code does not call Drive)",
});
