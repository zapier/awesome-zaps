// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const GRANOLA_API_KEY = "REPLACE_GRANOLA_API_KEY"; // Ask the user to create a personal API key in the Granola desktop app (Settings, Connectors, API keys) with the Personal notes scope. Granola's Business and Enterprise plans include API access; anyone who can read the workflow's source can read the key.
export const MY_EMAIL = "REPLACE_MY_EMAIL"; // Ask the user for the email on their Granola account. Only notes they own get a follow-up, not notes others shared with them.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user where the follow-ups land: their own Slack member ID for a DM (look it up with their Slack connection), or a channel only they read.

// Each run reads the notes that changed in this many minutes. It matches the hourly trigger in triggers/every-hour.ts; change both together.
export const WINDOW_MINUTES = 60;
// A note counts as new only if its meeting started within this many hours, so an older note edited today isn't posted again.
export const LOOKBACK_HOURS = 4;
// Characters of transcript the AI reads per meeting. A longer transcript is cut from the end.
export const MAX_TRANSCRIPT_CHARS = 60000;
// Name the follow-ups post under.
export const BOT_NAME = "Meeting follow-ups";
// AI model tier; "premium/auto" lets AI by Zapier pick an available model.
export const AI_MODEL_ID = "premium/auto";
// "0" uses Zapier-managed AI credentials.
export const AI_AUTHENTICATION_ID = "0";

// The prompt for each meeting.
export const FOLLOW_UP_INSTRUCTIONS =
  'You turn one meeting into a recap and a follow-up email for the user. You get the meeting\'s title, the attendees, Granola\'s summary, the user\'s own notes and the transcript, where "Me" is the user.\n\nUse only what the meeting contains. Never invent a decision, an owner, a date or a promise. When the summary and the transcript disagree, go with the transcript.\n\nrecap: Slack formatting, no intro line, short enough to read in 30 seconds. *Decisions*, then one "• " bullet per decision, at most 5: the ones that change what someone does next. *Action items*, then one "• " bullet per item that has a clear owner: the owner in bold, what they\'ll do, and the date if one was said. The user\'s own items come first, with *You* as the owner. Leave out a section with nothing in it.\n\nfollow_up: a short email from the user to the other people in the meeting, ready to paste. Greet them by first name, from the attendees or, if none are listed, from the transcript. First line "Subject: …", a blank line, then the body: a few words of thanks, what was agreed, and who does what by when, with the user\'s own items as "I\'ll …". Under 150 words, first person, plain sentences, no em dashes, no sign-off fluff. Return an empty string only when nothing was agreed.';
