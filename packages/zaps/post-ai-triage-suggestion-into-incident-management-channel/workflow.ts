import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Microsoft Teams team ID that contains the incident channel.
const INCIDENT_TEAM_ID = "YOUR_TEAM_ID";
// Microsoft Teams channel ID of the incident channel. Only messages from this channel are triaged.
const INCIDENT_CHANNEL_ID = "YOUR_CHANNEL_ID";
// Capability-to-team mapping the model uses to pick an owning team. One capability per line, e.g. "Payments: Payments team".
const CAPABILITY_TO_TEAM_MAP = "YOUR_CAPABILITY_TO_TEAM_MAPPING";

const TRIAGE_INSTRUCTIONS = [
  "You triage incident reports.",
  "Using the capability-to-team mapping, identify the capability the incident message is about and the team or teams that own it.",
  "Give your confidence as high, medium or low, and one sentence of rationale.",
  "If nothing in the mapping fits, return matched_capability as none and use low confidence.",
].join(" ");

// Field names follow the Teams trigger's output. Confirm them against a real sample on the first test run.
const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    subject: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "post-ai-triage-suggestion-into-incident-management-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const messageId = String(input.id ?? "").trim();
    const messageText = [input.subject, input.body]
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!messageId || !messageText) {
      return { skipped: true, reason: "no-message-id-or-text" };
    }

    const triage = await ctx.step("triage-incident-message", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          authentication_id: "0",
          model_id: "premium/auto",
          includeWorkflowData: false,
          instructions: TRIAGE_INSTRUCTIONS,
          inputFields: {
            message: messageText,
            capability_map: CAPABILITY_TO_TEAM_MAP,
          },
          outputSchema: {
            matched_capability:
              "The capability from the mapping that best fits the message, or none",
            owning_teams: "The team or teams that own that capability",
            confidence: "high, medium or low",
            rationale: "One sentence explaining the match",
          },
        },
      }),
    );

    const suggestion = (triage.data?.[0] ?? {}) as Record<string, unknown>;
    const confidence = String(suggestion.confidence ?? "low").toLowerCase();
    // Medium is advisory: it is labelled for a human to review. Nothing is auto-assigned.
    const confidenceLabel =
      confidence === "high"
        ? "High"
        : confidence === "medium"
          ? "Medium (advisory, review before routing)"
          : "Low";

    const reply = [
      `Suggested owner: ${String(suggestion.owning_teams ?? "unknown")}`,
      `Capability: ${String(suggestion.matched_capability ?? "unknown")}`,
      `Confidence: ${confidenceLabel}`,
      `Why: ${String(suggestion.rationale ?? "")}`,
    ].join("\n");

    const posted = await ctx.step("reply-with-triage-suggestion", async () =>
      sdk.runAction({
        appKey: "microsoft-teams",
        actionType: "write",
        actionKey: "reply_to_channel_message",
        connection: "microsoft-teams",
        inputs: {
          reply,
          format: "text",
          team_id: INCIDENT_TEAM_ID,
          channel_id: INCIDENT_CHANNEL_ID,
          message_id: messageId,
        },
      }),
    );

    return { messageId, confidence, posted: posted.data?.[0] ?? null };
  },
);

export default workflow;
