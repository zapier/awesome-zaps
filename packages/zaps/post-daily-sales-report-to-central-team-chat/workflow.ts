import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Slack channel ID the summary is posted to (open the channel in Slack, then copy its ID).
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Form question titles, exactly as they appear on the daily sales report form. Change each to match your form.
const FIELD = {
  date: "Date",
  branch: "Branch",
  totalSales: "Total sales",
  orderCount: "Number of orders",
  sellers: "Sellers",
  diagnostics: "Diagnostic flags",
};
// Keep "no" so the summary never links or mentions any user or channel.
const LINK_NAMES = "no";

const InputSchema = z.object({}).loose();

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function text(input: Record<string, unknown>, question: string): string {
  const value = String(input[question] ?? "").trim();
  return value || "(not given)";
}

function count(input: Record<string, unknown>, question: string): string {
  const parsed = toNumber(input[question]);
  return parsed === null ? "(missing)" : parsed.toLocaleString("en-US");
}

function buildSummary(input: Record<string, unknown>): string {
  return [
    `Daily sales report: ${text(input, FIELD.branch)}, ${text(input, FIELD.date)}`,
    `Total sales: ${count(input, FIELD.totalSales)}`,
    `Orders: ${count(input, FIELD.orderCount)}`,
    `Sellers: ${text(input, FIELD.sellers)}`,
    `Diagnostic flags: ${text(input, FIELD.diagnostics)}`,
  ].join("\n");
}

const workflow = defineDurable<unknown, unknown>(
  "post-daily-sales-report-to-central-team-chat",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const summary = buildSummary(input);

    const posted = await ctx.step("post-sales-summary-to-team-chat", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text: summary,
          as_bot: "yes",
          unfurl: "no",
          link_names: LINK_NAMES,
          add_edit_link: "no",
        },
      }),
    );

    return { summary, posted: posted.data[0] ?? null };
  },
);

export default workflow;
