import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Slack channel ID to post into (starts with C). Use the channel your team reads.
const SLACK_CHANNEL_ID = "YOUR_SLACK_CHANNEL_ID";
// Column keys for the survey fields (COL$A = column A).
const CUSTOMER_NAME_COLUMN = "COL$B";
const SATISFACTION_COLUMN = "COL$C";
const OWNER_COLUMN = "COL$D";
const ENTRY_SOURCE_COLUMN = "COL$E";
const VIDEO_LINK_COLUMN = "COL$F";
const COMMENTS_COLUMN = "COL$G";
const SURVEY_STATUS_COLUMN = "COL$I";
const NOTIFIED_COLUMN = "COL$J";
// Survey status that qualifies a row for a notification.
const COMPLETED_STATUS = "Completed";
// Value written to the notified column so a row is announced once.
const NOTIFIED_VALUE = "notified";
// Set to true to @mention the assigned owner. The owner value must match a Slack handle.
const MENTION_ASSIGNED_OWNER = false;
// Name shown as the bot above the message.
const BOT_NAME = "Lost customer survey";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "post-updated-lost-customer-survey-row-to-team-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const rowId = String(input.id);
    const field = (column: string) => String(input[column] ?? "").trim();

    if (field(SURVEY_STATUS_COLUMN) !== COMPLETED_STATUS) {
      return { skipped: true, reason: "survey-not-completed", rowId };
    }
    if (field(NOTIFIED_COLUMN) === NOTIFIED_VALUE) {
      return { skipped: true, reason: "already-notified", rowId };
    }

    const customer = field(CUSTOMER_NAME_COLUMN) || "Unknown customer";
    const source = field(ENTRY_SOURCE_COLUMN);
    const score = field(SATISFACTION_COLUMN);
    const owner = field(OWNER_COLUMN);
    const video = field(VIDEO_LINK_COLUMN);
    const comments = field(COMMENTS_COLUMN);
    const rowLink = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${WORKSHEET_ID}&range=A${rowId}`;

    const text = [
      `*${customer}*${source ? ` (${source})` : ""}`,
      score ? `Satisfaction score: ${score}` : null,
      owner
        ? `Assigned owner: ${MENTION_ASSIGNED_OWNER ? "@" : ""}${owner}`
        : null,
      video ? `Video: ${video}` : null,
      comments || null,
      `Row: ${rowLink}`,
    ]
      .filter(Boolean)
      .join("\n");

    const message = await ctx.step("post-channel-message", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL_ID,
          text,
          as_bot: "yes",
          username: BOT_NAME,
          link_names: MENTION_ASSIGNED_OWNER ? "yes" : "no",
          add_edit_link: "no",
          unfurl: "no",
        },
      }),
    );

    const marked = await ctx.step("mark-row-notified", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "update_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          row: rowId,
          [NOTIFIED_COLUMN]: NOTIFIED_VALUE,
        },
      }),
    );

    return {
      rowId,
      customer,
      messageTs: message.data[0]?.ts ?? null,
      markedRow: marked.data[0]?.row ?? null,
    };
  },
);

export default workflow;
