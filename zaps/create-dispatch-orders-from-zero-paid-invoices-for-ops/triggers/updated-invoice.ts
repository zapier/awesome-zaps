// What starts the zap: a Xero invoice in the watched organization updated to paid. workflow.ts checks the total.
export default {
  app: "xero",
  event: "updated_invoice_v2",
  connection: "xero",
  params: {
    // Look up with the user's Xero connection the organization whose invoices are watched, then use its ID. Same value as XERO_ORGANIZATION in config.ts.
    organization: "REPLACE_XERO_ORGANIZATION",
    status: "paid",
  },
};
