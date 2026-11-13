// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const LOAN_OBJECT = "REPLACE_LOAN_OBJECT"; // Ask the user which Salesforce object holds the loans, then look up its API name with their Salesforce connection.
export const EXTERNAL_LOAN_ID_FIELD = "REPLACE_EXTERNAL_LOAN_ID_FIELD"; // Ask the user which field on the loan object stores the external loan ID from the feed, then look up its API name with their Salesforce connection.

// Field API names on LOAN_OBJECT for the values the feed updates.
export const STATUS_FIELD = "REPLACE_STATUS_FIELD"; // Ask the user which field holds the loan status picklist, then look up its API name with their Salesforce connection.
export const PROPERTY_STREET_FIELD = "REPLACE_PROPERTY_STREET_FIELD"; // Ask the user which field holds the property street address, then look up its API name with their Salesforce connection.
export const PROPERTY_CITY_FIELD = "REPLACE_PROPERTY_CITY_FIELD"; // Ask the user which field holds the property city, then look up its API name with their Salesforce connection.
export const PROPERTY_STATE_FIELD = "REPLACE_PROPERTY_STATE_FIELD"; // Ask the user which field holds the property state, then look up its API name with their Salesforce connection.
export const PROPERTY_POSTAL_CODE_FIELD = "REPLACE_PROPERTY_POSTAL_CODE_FIELD"; // Ask the user which field holds the property postal code, then look up its API name with their Salesforce connection.
export const PRINCIPAL_BALANCE_FIELD = "REPLACE_PRINCIPAL_BALANCE_FIELD"; // Ask the user which field holds the principal balance, then look up its API name with their Salesforce connection.
export const INTEREST_RATE_FIELD = "REPLACE_INTEREST_RATE_FIELD"; // Ask the user which field holds the interest rate, then look up its API name with their Salesforce connection.
export const NEXT_PAYMENT_DATE_FIELD = "REPLACE_NEXT_PAYMENT_DATE_FIELD"; // Ask the user which field holds the next payment date, then look up its API name with their Salesforce connection.
export const MATURITY_DATE_FIELD = "REPLACE_MATURITY_DATE_FIELD"; // Ask the user which field holds the maturity date, then look up its API name with their Salesforce connection.
