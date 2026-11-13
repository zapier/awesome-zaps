// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const LEAVE_REQUESTS_TABLE_ID = "REPLACE_LEAVE_REQUESTS_TABLE_ID"; // Zapier Tables table of leave requests. Its "Trigger Zap Button Clicked" trigger fires from here.
export const LEAVE_TRACKER_TABLE_ID = "REPLACE_LEAVE_TRACKER_TABLE_ID"; // Zapier Tables table of allowances, one row per requester: data__f1 email, data__f2 name, data__f3 allowance_remaining.
export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Google Calendar the approved leave events are created on.
