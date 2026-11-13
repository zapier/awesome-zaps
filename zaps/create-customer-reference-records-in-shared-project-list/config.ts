// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const SITE_ID = "REPLACE_SITE_ID"; // Microsoft SharePoint site ID that holds the shared customer reference list.
export const LIST_ID = "REPLACE_LIST_ID"; // SharePoint list ID of the shared customer reference list.
export const CUSTOMER_ID_COLUMN = "REPLACE_CUSTOMER_ID_COLUMN"; // List column that stores the QuickBooks customer ID. Used to find an existing reference.
export const EMAIL_COLUMN = "REPLACE_EMAIL_COLUMN"; // List column for the customer's primary email address.
export const PHONE_COLUMN = "REPLACE_PHONE_COLUMN"; // List column for the customer's primary phone number.
