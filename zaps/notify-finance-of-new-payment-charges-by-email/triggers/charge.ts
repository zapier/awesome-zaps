export default {
  app: "stripe",
  event: "new_charge",
  connection: "stripe",
  // Keep charges that belong to a payment intent: most card payments today have one, and this zap has no New Payment trigger to catch them instead.
  params: { ignore_payments: false },
};
