import { ask } from "zap-pack";

// GitHub repository to watch for new commits, as "owner/repo".
export const GITHUB_REPO = "YOUR_OWNER/YOUR_REPO";
export const SUB_ZAP_URL = ask(
  "Webhook URL of the sub-zap that receives each merged pull request commit.",
);
