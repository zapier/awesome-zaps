import { ask } from "zap-pack";

export const TABLE_ID = ask(
  "Zapier Tables table that holds the billing records (the ID in the table's URL).",
);
// Field holding the customer reference, matched against Stripe customers by email.
export const CUSTOMER_REF_FIELD = "f1";
// Field holding the amount in major units (e.g. 49.99).
export const AMOUNT_FIELD = "f2";
// Field holding the three-letter currency code (e.g. usd).
export const CURRENCY_FIELD = "f3";
// Field holding an optional payment description.
export const DESCRIPTION_FIELD = "f4";
// Field the created payment intent ID is written to.
export const PAYMENT_INTENT_ID_FIELD = "f5";
// Field the payment intent status is written to.
export const PAYMENT_STATUS_FIELD = "f6";
// Checkbox field marked true once the record has been processed.
export const PROCESSED_FIELD = "f7";
