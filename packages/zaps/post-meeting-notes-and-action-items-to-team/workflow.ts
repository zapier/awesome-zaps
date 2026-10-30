import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Slack channel ID to post the summary to (the channel's ID, not its name).
const SLACK_CHANNEL_ID = "YOUR_SLACK_CHANNEL_ID";
// Zapier Tables table with one row per meeting (columns: title, date, link, action items).
const MEETINGS_TABLE_ID = "YOUR_TABLE_ID";
// Google Drive export URL for a file's plain text. FILE_ID is replaced with the file's ID.
const TRANSCRIPT_URL_TEMPLATE =
  "https://docs.google.com/document/d/FILE_ID/export?format=txt";
// Set to true to let Slack notify people named in the summary (mentions and channel names).
const ALLOW_MENTIONS = false;
// Line in the transcript that marks where the action items start.
const ACTION_ITEMS_MARKER = "Suggested next steps";
// Most action items posted to Slack in one message.
const MAX_ACTION_ITEMS = 20;

const InputSchema = z
  .object({
    title: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    file_id: z.string().nullable().optional(),
    file_url: z.string().nullable().optional(),
    text_url: z.string().nullable().optional(),
  })
  .loose();

function formatMeetingDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function extractActionItems(transcript: string): string[] {
  const lines = transcript.split("\n");
  const start = lines.findIndex((line) => line.includes(ACTION_ITEMS_MARKER));
  if (start === -1) {
    return [];
  }
  return lines
    .slice(start + 1)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2))
    .slice(0, MAX_ACTION_ITEMS);
}

const workflow = defineDurable<unknown, unknown>(
  "post-meeting-notes-and-action-items-to-team",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const title = input.title ?? "Untitled meeting";
    const meetingDate = await ctx.step("format-meeting-date", async () =>
      input.created_at ? formatMeetingDate(input.created_at) : "Unknown date",
    );
    const fileUrl = input.file_url ?? "";
    const textUrl =
      input.text_url ??
      TRANSCRIPT_URL_TEMPLATE.replace("FILE_ID", input.file_id ?? "");

    const transcript = await ctx.step("fetch-transcript-text", async () => {
      const response = await sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "get",
        inputs: { url: textUrl, as_json: "no" },
      });
      return String(response.data[0]?.text ?? "");
    });

    const actionItems = extractActionItems(transcript);
    const actionItemsText =
      actionItems.length > 0
        ? actionItems.map((item) => `• ${item}`).join("\n")
        : "No action items found.";

    await ctx.step("create-meeting-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: MEETINGS_TABLE_ID,
          new__data__f1: title,
          new__data__f2: meetingDate,
          new__data__f3: fileUrl,
          new__data__f4: actionItems.join("\n"),
        },
      }),
    );

    const message = `*${title}*\n${meetingDate}\n${fileUrl}\n\nAction items:\n${actionItemsText}`;

    const posted = await ctx.step("post-summary-to-slack", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL_ID,
          text: message,
          as_bot: "yes",
          unfurl: "no",
          link_names: ALLOW_MENTIONS ? "yes" : "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      title,
      meetingDate,
      actionItems,
      posted: posted.data[0] ?? null,
    };
  },
);

export default workflow;
