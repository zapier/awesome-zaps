import { ask } from "zap-pack";

export const BASE_ID = ask(
  'Airtable base ID (starts with "app") that holds the asset and IT tickets tables.',
);
export const ASSET_TABLE = ask(
  "Website asset table. The trigger watches this table for new or updated records.",
);
export const ASSET_MODIFIED_FIELD = ask(
  "Last-modified-time column in the asset table that the trigger uses to detect updates.",
);
export const TICKETS_TABLE = ask(
  "IT tickets table where new tickets are created.",
);
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
