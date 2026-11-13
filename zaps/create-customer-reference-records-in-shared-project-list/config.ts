// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const SITE_ID = "REPLACE_SITE_ID"; // Ask the user which SharePoint site holds the shared customer reference list, then look up its ID with their Microsoft SharePoint connection.
export const LIST_ID = "REPLACE_LIST_ID"; // Ask the user which list is the shared customer reference list, then look up its ID with their Microsoft SharePoint connection.
export const CUSTOMER_ID_COLUMN = "REPLACE_CUSTOMER_ID_COLUMN"; // Look up with the user's Microsoft SharePoint connection the list column that stores the QuickBooks customer ID, by its internal name, not its display header. Used to find an existing reference.
export const EMAIL_COLUMN = "REPLACE_EMAIL_COLUMN"; // Look up with the user's Microsoft SharePoint connection the list column for the customer's primary email address.
export const PHONE_COLUMN = "REPLACE_PHONE_COLUMN"; // Look up with the user's Microsoft SharePoint connection the list column for the customer's primary phone number.
