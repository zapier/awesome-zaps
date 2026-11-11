import { ask } from "zap-pack";

export const AIRTABLE_BASE_ID = ask(
  'Airtable base ID (the "app..." part of the base URL).',
);
export const EMPLOYEE_TABLE = ask(
  "Name of the Airtable table that holds employee records.",
);
export const EMAIL_FIELD = ask(
  "Employee column matched first, against the entry's email.",
);
export const FULL_NAME_FIELD = ask(
  "Employee column matched as fallback, against the entry's full name (exact match).",
);
export const TIME_TRACKING_LINK_FIELD = ask(
  "Multi-link column the time-tracking record ID is appended to. Existing links are kept.",
);
