// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const GRANOLA_API_KEY = "REPLACE_GRANOLA_API_KEY"; // Ask the user to create a personal API key in the Granola desktop app (Settings, Connectors, API keys) with the Personal notes scope. Granola's Business and Enterprise plans include API access; anyone who can read the workflow's source can read the key.
export const MY_EMAIL = "REPLACE_MY_EMAIL"; // Ask the user for the email on their Google Calendar, so they aren't counted as a guest of their own meetings.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user where the brief lands: their own Slack member ID for a DM (look it up with their Slack connection), or a channel only they read.

// The brief covers meetings that start between the run and this many hours later. The trigger runs early in the
// morning, so 14 hours reaches the end of the working day.
export const HOURS_AHEAD = 14;
// How far back to look for past meetings with the same people.
export const LOOKBACK_DAYS = 90;
// The most recent past meetings the AI reads for each meeting today.
export const NOTES_PER_MEETING = 3;
// Meetings with more guests than this are left out, since a large meeting's past notes are rarely about the people in it.
export const MAX_GUESTS = 8;
// Meetings whose title contains any of these words are left out. Case doesn't matter.
export const SKIP_WORDS = ["hold", "focus", "lunch", "OOO"];
// Characters of each past meeting's summary and notes the AI reads.
export const MAX_NOTE_CHARS = 6000;
// Name the brief posts under.
export const BOT_NAME = "Morning brief";
// AI model tier; "premium/auto" lets AI by Zapier pick an available model.
export const AI_MODEL_ID = "premium/auto";
// "0" uses Zapier-managed AI credentials.
export const AI_AUTHENTICATION_ID = "0";

// The prompt for each meeting.
export const BRIEF_INSTRUCTIONS =
  'You prepare the user for one meeting today. You get the meeting\'s title, its guests, and the summaries of the user\'s most recent past meetings with those people, newest first, each with its date and any notes the user wrote.\n\nUse only what the past meetings contain. Never invent a decision, an owner, a date or a promise. If the past meetings have nothing to do with this meeting, return an empty string.\n\nbrief: Slack formatting, no intro line, short enough to read in 20 seconds. *Where you left off*, then one or two sentences on the last conversation and its date. *Open items*, then one "• " bullet per promise that may still be open: the owner in bold, with *You* for the user, what they said they\'d do, and the date if one was said. *Worth raising*, then one or two "• " bullets the user could bring up. Leave out a section with nothing in it.';
