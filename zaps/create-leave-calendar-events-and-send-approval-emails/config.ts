// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const LEAVE_REQUESTS_TABLE_ID = "REPLACE_LEAVE_REQUESTS_TABLE_ID"; // Look up with the user's Zapier Tables connection the table of leave requests, then set the trigger to it. Its "Trigger Zap Button Clicked" trigger fires from here.
export const LEAVE_TRACKER_TABLE_ID = "REPLACE_LEAVE_TRACKER_TABLE_ID"; // Look up with the user's Zapier Tables connection the table of allowances, one row per requester: data__f1 email, data__f2 name, data__f3 allowance_remaining.
export const CALENDAR_ID = "REPLACE_CALENDAR_ID"; // Look up with the user's Google Calendar connection the calendar approved leave events are created on.
