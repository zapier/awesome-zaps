import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID of the A/B test log (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column holding the test name (COL$A = column A).
const TEST_NAME_COLUMN = "COL$A";
// Column holding the first variant's description.
const VARIANT_A_COLUMN = "COL$B";
// Column holding the second variant's description.
const VARIANT_B_COLUMN = "COL$C";
// Column holding the test URL; also used to skip repeat posts for the same test.
const TEST_URL_COLUMN = "COL$D";
// Column holding the reporter / user who logged the test.
const REPORTER_COLUMN = "COL$E";
// Column holding an optional screenshot URL.
const SCREENSHOT_COLUMN = "COL$F";
// Slack channel ID to post to (from the channel's details, e.g. "C0123456789").
const SLACK_CHANNEL_ID = "YOUR_SLACK_CHANNEL_ID";
// Prefix the post with @channel so everyone in the channel is notified.
const MENTION_CHANNEL = true;

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    row: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

function cell(input: Record<string, unknown>, column: string): string {
  const value = input[column];
  return value === null || value === undefined ? "" : String(value).trim();
}

const workflow = defineDurable<unknown, unknown>(
  "post-new-a-b-test-rows-to-team-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    ) as Record<string, unknown> & { id?: unknown; row?: unknown };
    const rowNumber = Number(input.row ?? input.id ?? 0);

    const testName = cell(input, TEST_NAME_COLUMN);
    const variantA = cell(input, VARIANT_A_COLUMN);
    const variantB = cell(input, VARIANT_B_COLUMN);
    const testUrl = cell(input, TEST_URL_COLUMN);
    const reporter = cell(input, REPORTER_COLUMN);
    const screenshot = cell(input, SCREENSHOT_COLUMN);

    if (!testName && !variantA && !variantB && !testUrl) {
      return { skipped: true, reason: "empty-row", row: rowNumber };
    }

    if (testUrl) {
      const matches = await ctx.step("find-rows-with-same-url", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "search",
          actionKey: "find_many_rows",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: WORKSHEET_ID,
            lookup_key: TEST_URL_COLUMN,
            lookup_value: testUrl,
            row_count: 50,
          },
        }),
      );
      const rows =
        (
          matches.data?.[0] as
            { rows?: { row?: number | string }[] } | undefined
        )?.rows ?? [];
      const earlier = rows.find(
        (r) => rowNumber > 0 && Number(r.row) < rowNumber,
      );
      if (earlier) {
        return {
          skipped: true,
          reason: "duplicate-url",
          row: rowNumber,
          firstRow: Number(earlier.row),
          testUrl,
        };
      }
    }

    const lines = [
      `${MENTION_CHANNEL ? "<!channel> " : ""}*New A/B test:* ${testName || "(untitled test)"}`,
      `• *Variant A:* ${variantA || "—"}`,
      `• *Variant B:* ${variantB || "—"}`,
      `• *Test URL:* ${testUrl ? `<${testUrl}|Open the test>` : "—"}`,
      `• *Reported by:* ${reporter || "unknown"}`,
      `• *Screenshot:* ${screenshot ? `<${screenshot}|View screenshot>` : "_none attached yet (add a link in the sheet)_"}`,
    ];

    const post = await ctx.step("post-test-to-channel", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL_ID,
          text: lines.join("\n"),
          as_bot: "yes",
          link_names: "yes",
          add_edit_link: "no",
          ...(screenshot ? { image_url: screenshot } : {}),
        },
      }),
    );

    const sent = post.data?.[0] as
      { ts?: string; message?: { permalink?: string } } | undefined;
    return {
      posted: true,
      row: rowNumber,
      testName,
      ts: sent?.ts ?? null,
      permalink: sent?.message?.permalink ?? null,
    };
  },
);

export default workflow;
