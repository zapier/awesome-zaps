import { ask } from "zap-pack";

export const AIRTABLE_BASE_ID = ask(
  "Airtable base ID that holds the request log (the long ID in the base's URL).",
);
export const AIRTABLE_TABLE_NAME = ask(
  "Table in that base that holds one row per palette request.",
);
// Column names in that table. They must match the table's field names exactly.
export const AIRTABLE_REQUESTER_ID_FIELD = "Requester ID";
export const AIRTABLE_REQUESTER_NAME_FIELD = "Requester name";
export const AIRTABLE_COMMAND_FIELD = "Command";
export const AIRTABLE_MESSAGE_FIELD = "Message note";
export const AIRTABLE_ORIGIN_FIELD = "Origin";
export const SLACK_CHANNEL_ID = ask(
  "Slack channel ID that receives the palette (the long ID from the channel's details).",
);
// Prefix on every record and message this workflow creates. Test runs use "[install-test] "; set it to "" once installed.
export const RESOURCE_PREFIX = "[install-test] ";
