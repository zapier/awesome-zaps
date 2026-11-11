// Appointment field (API name) holding the staff reference; falls back to the record's OwnerId.
export const APPOINTMENT_STAFF_REF_FIELD = "Staff_Reference__c";
// Appointment field (API name) holding the appointment type used to pick a bonus tier.
export const APPOINTMENT_TYPE_FIELD = "Type__c";
// Staff object (API name) and the field on it that matches the appointment's staff reference.
export const STAFF_OBJECT = "Staff__c";
export const STAFF_MATCH_FIELD = "Staff_Reference__c";
// Staff Account Transaction object (API name) and its fields.
export const TRANSACTION_OBJECT = "Staff_Account_Transaction__c";
export const TX_CREATED_DATE_FIELD = "Transaction_Created_Date__c";
export const TX_STAFF_LOOKUP_FIELD = "Staff__c";
export const TX_AMOUNT_FIELD = "Amount__c";
export const TX_MEMO_FIELD = "Memo__c";
export const TX_CLASSIFICATION_FIELD = "Type__c";
export const TX_DETAIL_FIELD = "Detail__c";
// Classification labels written on every bonus transaction.
export const TX_CLASSIFICATION_VALUE = "Credit";
export const TX_DETAIL_VALUE = "Appointment Bonus";
