// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const REPORT_ID = "REPLACE_REPORT_ID"; // Salesforce report to run each hour (the report's ID, the 15/18-character ID in its URL).
export const REPORTING_TABLE_ID = "REPLACE_REPORTING_TABLE_ID"; // Zapier Tables table that receives the report rows (the table's ID).

// Field keys of the reporting table, as Zapier Tables names them.
export const FIELD_RECORD_KEY = "new__data__f1";
export const FIELD_ACCOUNT = "new__data__f2";
export const FIELD_OPPORTUNITY = "new__data__f3";
export const FIELD_AMOUNT = "new__data__f4";
export const FIELD_CLOSE_DATE = "new__data__f5";
export const FIELD_STAGE = "new__data__f6";
export const FIELD_OWNER = "new__data__f7";
export const FIELD_SYNCED_AT = "new__data__f8";
