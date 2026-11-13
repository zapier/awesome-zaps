// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const RECIPIENT = "REPLACE_RECIPIENT"; // Ask the user who receives the reminder: a stakeholder address or a Google Group.
export const MEETING_DATE = "REPLACE_MEETING_DATE"; // Ask the user the board meeting date, written the way it should read in the email.
export const AGENDA_LINK = "REPLACE_AGENDA_LINK"; // Ask the user for the link to the agenda and packet submission page. If empty, no reminder is sent.

// Board meeting name, used in the subject and body.
export const MEETING_TITLE = "Board meeting";
