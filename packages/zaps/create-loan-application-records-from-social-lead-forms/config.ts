import { ask } from "zap-pack";

export const AIRTABLE_BASE_ID = ask(
  'Airtable base ID (starts with "app", from the base URL).',
);
export const AIRTABLE_TABLE = ask(
  'Airtable table ID ("tbl…") or exact table name for loan applications.',
);
// Airtable field names in the intake table. Records are matched on FIELD_EMAIL.
export const FIELD_EXTERNAL_REF = "Submission ID";
export const FIELD_APPLIED_AT = "Application Timestamp";
export const FIELD_FULL_NAME = "Full Name";
export const FIELD_EMAIL = "Email";
export const FIELD_PHONE = "Phone";
export const FIELD_BUSINESS_NAME = "Business Name";
export const FIELD_REVENUE = "Revenue Estimate";
export const FIELD_CAMPAIGN = "Campaign";
export const FIELD_AD_SET = "Ad Set";
export const FIELD_AD = "Ad";
export const FIELD_FORM = "Lead Form";
export const FIELD_SOURCE = "Source";
// Single source label written to every record, for campaign reporting.
export const SOURCE_LABEL = "Facebook Lead Ads";
// Lead form question keys as Facebook Lead Ads delivers them (custom questions vary per form).
export const LEAD_PHONE_KEY = "PHONE_NUMBER";
export const LEAD_BUSINESS_NAME_KEY = "COMPANY_NAME";
export const LEAD_REVENUE_KEY = "ANNUAL_REVENUE";
// Time zone for the readable application timestamp.
export const TIME_ZONE = "UTC";
