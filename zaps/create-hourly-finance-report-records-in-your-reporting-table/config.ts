import { ask } from "zap-pack";

export const REPORT_ID = ask(
  "Salesforce report to run each hour (the report's ID, the 15/18-character ID in its URL).",
);
export const REPORTING_TABLE_ID = ask(
  "Zapier Tables table that receives the report rows (the table's ID).",
);
// Field keys of the reporting table, as Zapier Tables names them.
export const FIELD_RECORD_KEY = "new__data__f1";
export const FIELD_ACCOUNT = "new__data__f2";
export const FIELD_OPPORTUNITY = "new__data__f3";
export const FIELD_AMOUNT = "new__data__f4";
export const FIELD_CLOSE_DATE = "new__data__f5";
export const FIELD_STAGE = "new__data__f6";
export const FIELD_OWNER = "new__data__f7";
export const FIELD_SYNCED_AT = "new__data__f8";
