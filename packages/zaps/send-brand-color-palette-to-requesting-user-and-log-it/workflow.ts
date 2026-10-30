import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Airtable base ID that holds the request log (the long ID in the base's URL).
const AIRTABLE_BASE_ID = "YOUR_AIRTABLE_BASE_ID";
// Table in that base that holds one row per palette request.
const AIRTABLE_TABLE_NAME = "YOUR_TABLE_NAME";
// Column names in that table. They must match the table's field names exactly.
const AIRTABLE_REQUESTER_ID_FIELD = "Requester ID";
const AIRTABLE_REQUESTER_NAME_FIELD = "Requester name";
const AIRTABLE_COMMAND_FIELD = "Command";
const AIRTABLE_MESSAGE_FIELD = "Message note";
const AIRTABLE_ORIGIN_FIELD = "Origin";
// Slack channel ID that receives the palette (the long ID from the channel's details).
const SLACK_CHANNEL_ID = "YOUR_SLACK_CHANNEL_ID";
// Prefix on every record and message this workflow creates. Test runs use "[install-test] "; set it to "" once installed.
const RESOURCE_PREFIX = "[install-test] ";
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
          connection: "airtable",
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
          connection: "airtable",
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
        connection: "slack",
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
