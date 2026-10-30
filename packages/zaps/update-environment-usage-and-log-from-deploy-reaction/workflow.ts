import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Reaction that marks a deploy (emoji name without colons). Also set as the trigger's Reaction filter.
const DEPLOY_REACTION = "rocket";
// Text the reacted message must contain (case-insensitive) to count as a deploy message.
const DEPLOY_MARKER = "deploy";
// Google Sheets spreadsheet ID (the long ID in the sheet's URL) holding both tabs below.
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID of the environment registry; the first tab is "0".
const REGISTRY_WORKSHEET_ID = "0";
// Registry column holding the environment name to match on (COL$A = column A).
const ENV_NAME_COLUMN = "COL$A";
// Registry column for the environment's status, overwritten with IN_USE_STATUS.
const STATUS_COLUMN = "COL$B";
// Registry column for the last-used timestamp.
const LAST_USED_COLUMN = "COL$C";
// Registry column for who last used the environment.
const LAST_USED_BY_COLUMN = "COL$D";
// Status written to the matching registry row.
const IN_USE_STATUS = "In use";
// Worksheet (tab) ID of the usage log (the number after #gid= in the tab's URL).
const LOG_WORKSHEET_ID = "YOUR_LOG_WORKSHEET_ID";
// Usage-log columns: timestamp, environment, previous status, new status, reacting user, message link.
const LOG_TIMESTAMP_COLUMN = "COL$A";
const LOG_ENV_COLUMN = "COL$B";
const LOG_PREVIOUS_STATUS_COLUMN = "COL$C";
const LOG_NEW_STATUS_COLUMN = "COL$D";
const LOG_REACTED_BY_COLUMN = "COL$E";
const LOG_MESSAGE_LINK_COLUMN = "COL$F";
// When true, the thread reply @-mentions the person who reacted. Off by default.
const MENTION_REACTOR = false;

// Environment identifier patterns, tried in order: "env: staging-2", "environment=prod", then "to staging".
const ENV_PATTERNS = [
  /\benv(?:ironment)?\s*[:=]\s*([A-Za-z0-9._-]+)/i,
  /\bto\s+([A-Za-z0-9._-]+)/i,
];

const InputSchema = z
  .object({
    reaction: z.string().nullable().optional(),
    user: z.string().nullable().optional(),
    conversation: z.string().nullable().optional(),
    event_timestamp: z.string().nullable().optional(),
    message: z
      .object({
        text: z.string().nullable().optional(),
        raw_text: z.string().nullable().optional(),
        ts: z.string().nullable().optional(),
        thread_ts: z.string().nullable().optional(),
        permalink: z.string().nullable().optional(),
        channel: z
          .object({ id: z.string().nullable().optional() })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

function extractEnvironment(text: string): string | null {
  for (const pattern of ENV_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].replace(/[.,;:]+$/, "");
  }
  return null;
}

const workflow = defineDurable<unknown, unknown>(
  "update-environment-usage-and-log-from-deploy-reaction",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const message = input.message ?? {};
    const text = message.text ?? message.raw_text ?? "";
    const reaction = input.reaction ?? "";

    if (DEPLOY_REACTION && reaction !== DEPLOY_REACTION) {
      return { skipped: true, reason: "not-deploy-reaction", reaction };
    }
    if (!text.toLowerCase().includes(DEPLOY_MARKER.toLowerCase())) {
      return { skipped: true, reason: "no-deploy-marker" };
    }
    const environment = extractEnvironment(text);
    if (!environment) {
      return { skipped: true, reason: "no-environment-in-message" };
    }

    const channel = input.conversation ?? message.channel?.id ?? null;
    const threadTs = message.thread_ts ?? message.ts ?? null;
    const reactorId = input.user ?? null;

    let reactorName = reactorId ?? "someone";
    if (reactorId) {
      const reactor = await ctx.step("find-reacting-user", async () =>
        sdk.runAction({
          appKey: "slack",
          actionType: "search",
          actionKey: "user_by_id",
          connection: "slack",
          inputs: { id: reactorId },
        }),
      );
      const found = reactor.data?.[0] as
        { name?: string; real_name?: string } | undefined;
      reactorName = found?.real_name || found?.name || reactorId;
    }

    const lookup = await ctx.step("find-environment-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: REGISTRY_WORKSHEET_ID,
          lookup_key: ENV_NAME_COLUMN,
          lookup_value: environment,
        },
      }),
    );
    const row = lookup.data?.[0] as Record<string, unknown> | undefined;
    const rowId = row?.id != null ? String(row.id) : null;
    const previousStatus = rowId
      ? String(row?.[STATUS_COLUMN] ?? "")
      : "(no registry row)";

    const usedAt = await ctx.step("capture-used-at", async () =>
      new Date().toISOString(),
    );

    if (rowId) {
      await ctx.step("update-environment-row", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "update_row",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: REGISTRY_WORKSHEET_ID,
            row: rowId,
            [ENV_NAME_COLUMN]: environment,
            [STATUS_COLUMN]: IN_USE_STATUS,
            [LAST_USED_COLUMN]: usedAt,
            [LAST_USED_BY_COLUMN]: reactorName,
          },
        }),
      );
    }

    await ctx.step("append-usage-log-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: LOG_WORKSHEET_ID,
          [LOG_TIMESTAMP_COLUMN]: usedAt,
          [LOG_ENV_COLUMN]: environment,
          [LOG_PREVIOUS_STATUS_COLUMN]: previousStatus,
          [LOG_NEW_STATUS_COLUMN]: rowId ? IN_USE_STATUS : "",
          [LOG_REACTED_BY_COLUMN]: reactorName,
          [LOG_MESSAGE_LINK_COLUMN]: message.permalink ?? "",
        },
      }),
    );

    if (!channel || !threadTs) {
      return {
        environment,
        rowId,
        previousStatus,
        usedAt,
        replied: false,
        reason: "no-thread-target",
      };
    }

    const who = MENTION_REACTOR && reactorId ? `<@${reactorId}>` : reactorName;
    const replyText = rowId
      ? `Environment \`${environment}\` marked ${IN_USE_STATUS} by ${who} (was: ${previousStatus || "blank"}). Usage logged at ${usedAt}.`
      : `No registry row found for \`${environment}\`; usage by ${who} logged at ${usedAt}.`;

    const reply = await ctx.step("post-thread-confirmation", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel,
          thread_ts: threadTs,
          text: replyText,
          as_bot: "yes",
          link_names: MENTION_REACTOR ? "yes" : "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    const posted = reply.data?.[0] as { ts?: string } | undefined;
    return {
      environment,
      rowId,
      previousStatus,
      usedAt,
      reactorName,
      replyTs: posted?.ts ?? null,
    };
  },
);

export default workflow;
