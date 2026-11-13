// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const INCIDENT_TEAM_ID = "REPLACE_INCIDENT_TEAM_ID"; // Microsoft Teams team ID that contains the incident channel.
export const INCIDENT_CHANNEL_ID = "REPLACE_INCIDENT_CHANNEL_ID"; // Microsoft Teams channel ID of the incident channel. Only messages from this channel are triaged.
export const CAPABILITY_TO_TEAM_MAP = "REPLACE_CAPABILITY_TO_TEAM_MAP"; // Capability-to-team mapping the model uses to pick an owning team. One capability per line, e.g. "Payments: Payments team".
