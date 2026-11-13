// The account this zap uses as "stripe"; workflow.ts and triggers/ refer to it by that alias.
export default {
  app: "stripe",
  description:
    "The user's Stripe connection, for the account whose subscriptions should be watched",
};
