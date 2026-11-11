import { ask } from "zap-pack";

export const HR_REQUESTER_EMAIL = ask(
  "Freshservice requester email: the HR address every change-of-manager ticket is filed under.",
);
export const HR_DEPARTMENT_ID = ask(
  "Freshservice department ID of the HR department (a number from the Department dropdown).",
);
// Freshservice ticket type.
export const TICKET_TYPE = "Service Request";
// Freshservice priority: Low, Medium, High or Urgent.
export const TICKET_PRIORITY = "Medium";
