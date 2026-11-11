import { connection } from "zap-pack";

export default connection({
  app: "google-calendar",
  description:
    "Used only by the trigger, for the account that can see the on-call calendar",
});
