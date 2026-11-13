// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const HR_REQUESTER_EMAIL = "REPLACE_HR_REQUESTER_EMAIL"; // Freshservice requester email: the HR address every change-of-manager ticket is filed under.
export const HR_DEPARTMENT_ID = "REPLACE_HR_DEPARTMENT_ID"; // Freshservice department ID of the HR department (a number from the Department dropdown).

// Freshservice ticket type.
export const TICKET_TYPE = "Service Request";
// Freshservice priority: Low, Medium, High or Urgent.
export const TICKET_PRIORITY = "Medium";
