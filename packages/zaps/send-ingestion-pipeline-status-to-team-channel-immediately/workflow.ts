import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Slack channel ID to post the status summary to (the ID, not the name, e.g. "C0123456").
const SLACK_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Status value that counts as a finished run. A post also happens whenever error_count is above zero.
const COMPLETED_STATUS = "completed";
// Set to true to @channel-mention the team on messages that report errors.
const MENTION_ON_ERRORS = false;

const InputSchema = z
  .object({
    body: z.unknown().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-ingestion-pipeline-status-to-team-channel-immediately",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const payload = parsePayload(input.body ?? input);
    if (!payload) {
      return { skipped: true, reason: "payload-not-a-json-object" };
    }

    const status =
      typeof payload.status === "string" ? payload.status : "unknown";
    const pipeline =
      typeof payload.pipeline === "string" ? payload.pipeline : null;
    const successCount = toCount(payload.success_count);
    const errorCount = toCount(payload.error_count);

    if (status !== COMPLETED_STATUS && errorCount === 0) {
      return { skipped: true, reason: "not-completed-and-no-errors", status };
    }

    const headline =
      errorCount > 0
        ? ":warning: Ingestion pipeline finished with errors"
        : ":white_check_mark: Ingestion pipeline completed";
    const pipelineLabel = pipeline ? ` (${pipeline})` : "";
    const mention = MENTION_ON_ERRORS && errorCount > 0 ? "<!channel> " : "";
    const text = `${mention}${headline}${pipelineLabel}\nStatus: ${status} · Succeeded: ${successCount} · Failed: ${errorCount}`;

    const posted = await ctx.step("post-status-to-team-channel", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          as_bot: "yes",
          unfurl: "no",
          link_names: MENTION_ON_ERRORS ? "yes" : "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      status,
      successCount,
      errorCount,
      posted: posted.data?.[0] ?? null,
    };
  },
);

function parsePayload(value: unknown): Record<string, unknown> | null {
  const parsed = typeof value === "string" ? parseJson(value) : value;
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toCount(value: unknown): number {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

export default workflow;
