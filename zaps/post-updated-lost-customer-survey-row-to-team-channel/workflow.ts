import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  SLACK_CHANNEL_ID,
  CUSTOMER_NAME_COLUMN,
  SATISFACTION_COLUMN,
  OWNER_COLUMN,
  ENTRY_SOURCE_COLUMN,
  VIDEO_LINK_COLUMN,
  COMMENTS_COLUMN,
  SURVEY_STATUS_COLUMN,
  NOTIFIED_COLUMN,
  COMPLETED_STATUS,
  NOTIFIED_VALUE,
  BOT_NAME,
} from "./config.ts";

const sdk = createZapierSdk();

// Set to true to @mention the assigned owner. The owner value must match a Slack handle.
const MENTION_ASSIGNED_OWNER = false;

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
  })
  .loose();

const workflow = defineDurable(
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
      messageTs: (message.data[0] as { ts?: string } | undefined)?.ts ?? null,
      markedRow: (marked.data[0] as { row?: number } | undefined)?.row ?? null,
    };
  },
);

export default workflow;
