import { connection } from "zap-pack";

export default connection({
  app: "stripe",
  description:
    "The user's Stripe connection, for the account whose subscriptions should be watched",
});
