import { ask } from "zap-pack";

export const CARRIER_EMAIL = ask(
  "Carrier inbox that receives every notice. Replace YOUR_EMAIL_ADDRESS with the carrier's address.",
);
