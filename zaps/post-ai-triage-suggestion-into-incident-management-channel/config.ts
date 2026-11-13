// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const INCIDENT_TEAM_ID = "REPLACE_INCIDENT_TEAM_ID"; // Look up with the user's Microsoft Teams connection: the team that contains the incident channel, by its team ID.
export const INCIDENT_CHANNEL_ID = "REPLACE_INCIDENT_CHANNEL_ID"; // Look up with the user's Microsoft Teams connection: the incident channel in that team, by its channel ID. Only messages from this channel are triaged.
export const CAPABILITY_TO_TEAM_MAP = "REPLACE_CAPABILITY_TO_TEAM_MAP"; // Ask the user which capabilities each team owns, then write one per line, e.g. "Payments: Payments team". The model uses this map to pick an owning team.
