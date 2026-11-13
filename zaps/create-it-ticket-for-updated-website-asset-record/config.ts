// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const BASE_ID = "REPLACE_BASE_ID"; // Ask the user which base holds the asset and IT tickets tables, then look up its ID (starts with "app") with their Airtable connection.
export const ASSET_TABLE = "REPLACE_ASSET_TABLE"; // Ask the user which table holds the website assets, then look up its name with their Airtable connection. The trigger watches this table for new or updated records.
export const ASSET_MODIFIED_FIELD = "REPLACE_ASSET_MODIFIED_FIELD"; // Ask the user which column in the asset table holds the last-modified time, then look up its name with their Airtable connection. The trigger uses it to detect updates.
export const TICKETS_TABLE = "REPLACE_TICKETS_TABLE"; // Ask the user which table holds the IT tickets, then look up its name with their Airtable connection. New tickets are created here.

// Asset column holding the unique asset ID. Tickets are matched on it.
export const ASSET_ID_FIELD = "Asset ID";
// Asset column holding the title, used in the ticket title.
export const ASSET_TITLE_FIELD = "Title";
// Asset column holding the submitter's name, used in the ticket title.
export const ASSET_SUBMITTER_FIELD = "Submitter";
// Asset column holding the date, used as the ticket start date.
export const ASSET_DATE_FIELD = "Date";
// Asset column holding a link back to the asset record, put in the ticket description.
export const ASSET_LINK_FIELD = "Asset link";
// Asset column holding a priority. Only "High" or "Critical" override the default.
export const ASSET_PRIORITY_FIELD = "Priority";
// Asset column that receives the new ticket's record ID. Used only if LINK_TICKET_ON_ASSET is true.
export const ASSET_TICKET_LINK_FIELD = "IT ticket";
// IT tickets column names.
export const TICKET_ID_FIELD = "Asset ID";
export const TICKET_TITLE_FIELD = "Title";
export const TICKET_START_FIELD = "Start date";
export const TICKET_DESCRIPTION_FIELD = "Description";
export const TICKET_PRIORITY_FIELD = "Priority";
export const TICKET_STATUS_FIELD = "Status";
// Status for a newly created ticket (the configured initial state).
export const INITIAL_STATUS = "Open";
// Priority used unless the asset flags a higher one.
export const DEFAULT_PRIORITY = "Medium";
