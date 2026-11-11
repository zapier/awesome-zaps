import { ask } from "zap-pack";

export const INCIDENT_TEAM_ID = ask(
  "Microsoft Teams team ID that contains the incident channel.",
);
export const INCIDENT_CHANNEL_ID = ask(
  "Microsoft Teams channel ID of the incident channel. Only messages from this channel are triaged.",
);
export const CAPABILITY_TO_TEAM_MAP = ask(
  'Capability-to-team mapping the model uses to pick an owning team. One capability per line, e.g. "Payments: Payments team".',
);
