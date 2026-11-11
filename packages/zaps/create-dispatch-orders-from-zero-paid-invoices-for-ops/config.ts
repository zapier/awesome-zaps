import { ask } from "zap-pack";

export const XERO_ORGANIZATION = ask(
  "Xero organization whose invoices are watched (the trigger's Organization field).",
);
export const CARTONCLOUD_TENANT = ask(
  "CartonCloud tenant the outbound orders are created in.",
);
export const CARTONCLOUD_CUSTOMER = ask(
  "CartonCloud customer the outbound orders are raised against.",
);
export const IT_ALERT_EMAIL = ask(
  "Gmail address that receives failure notices. Use an address you can read.",
);
