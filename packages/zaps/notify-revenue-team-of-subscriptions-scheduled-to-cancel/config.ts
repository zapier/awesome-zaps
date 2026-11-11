import { ask } from "zap-pack";

export const REVENUE_TEAM_EMAIL = ask(
  "Revenue team address that receives the cancellation alert (replace with your distribution list).",
);
export const ACCOUNT_OWNER_EMAIL = ask(
  "Account owner address that receives the same alert (replace with your account owner's address).",
);
