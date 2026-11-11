import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
  AIRTABLE_REQUESTER_ID_FIELD,
  AIRTABLE_REQUESTER_NAME_FIELD,
  AIRTABLE_COMMAND_FIELD,
  AIRTABLE_MESSAGE_FIELD,
  AIRTABLE_ORIGIN_FIELD,
  SLACK_CHANNEL_ID,
  RESOURCE_PREFIX,
} from "@/config";
import airtable from "@/connections/airtable";
import slack from "@/connections/slack";

const sdk = createZapierSdk();

// Brand palette posted in reply to the request. Replace these with your brand's colors.
const PRIMARY_COLORS = ["#1A3C6E", "#2E86AB", "#F4F1EA"];
const COMPLEMENTARY_COLORS = ["#E07A3F", "#7FB069"];

const InputSchema = z
  .object({
    user_id: z.string().nullable().optional(),
    user_name: z.string().nullable().optional(),
    command: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
    channel_id: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-brand-color-palette-to-requesting-user-and-log-it",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const requesterId = input.user_id ?? "unknown";
    const requesterName = input.user_name ?? "unknown";
    const command = input.command ?? "/brand-colors";
    const commandText = input.text ?? "";
    const originChannel = input.channel_id ?? "";

    const existing = await ctx.step(
      "find-airtable-request-by-requester",
      async () =>
        sdk.runAction({
          appKey: "airtable",
          actionType: "search",
          actionKey: "findRecord",
          connection: airtable,
          inputs: {
            applicationId: AIRTABLE_BASE_ID,
            tableName: AIRTABLE_TABLE_NAME,
            searchField: AIRTABLE_REQUESTER_ID_FIELD,
            searchValue: requesterId,
          },
        }),
    );

    let recordCreated = false;
    if (!existing.data?.[0]) {
      await ctx.step("create-airtable-request-record", async () =>
        sdk.runAction({
          appKey: "airtable",
          actionType: "write",
          actionKey: "createRecord",
          connection: airtable,
          inputs: {
            applicationId: AIRTABLE_BASE_ID,
            tableName: AIRTABLE_TABLE_NAME,
            [AIRTABLE_REQUESTER_ID_FIELD]: requesterId,
            [AIRTABLE_REQUESTER_NAME_FIELD]: `${RESOURCE_PREFIX}${requesterName}`,
            [AIRTABLE_COMMAND_FIELD]: command,
            [AIRTABLE_MESSAGE_FIELD]: commandText,
            [AIRTABLE_ORIGIN_FIELD]: originChannel,
          },
        }),
      );
      recordCreated = true;
    }

    const text = [
      `${RESOURCE_PREFIX}*Brand color palette* for ${requesterName}`,
      `*Primary:* ${PRIMARY_COLORS.join(", ")}`,
      `*Complementary:* ${COMPLEMENTARY_COLORS.join(", ")}`,
    ].join("\n");

    const message = await ctx.step("post-palette-to-slack", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: slack,
        inputs: {
          channel: SLACK_CHANNEL_ID,
          text,
          as_bot: "yes",
          link_names: "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      requesterId,
      recordCreated,
      slackMessage: message.data?.[0] ?? null,
    };
  },
);

export default workflow;
