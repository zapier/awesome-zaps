import { ask } from "zap-pack";

export const SITE_ID = ask(
  "Microsoft SharePoint site ID that holds the shared customer reference list.",
);
export const LIST_ID = ask(
  "SharePoint list ID of the shared customer reference list.",
);
export const CUSTOMER_ID_COLUMN = ask(
  "List column that stores the QuickBooks customer ID. Used to find an existing reference.",
);
export const EMAIL_COLUMN = ask(
  "List column for the customer's primary email address.",
);
export const PHONE_COLUMN = ask(
  "List column for the customer's primary phone number.",
);
