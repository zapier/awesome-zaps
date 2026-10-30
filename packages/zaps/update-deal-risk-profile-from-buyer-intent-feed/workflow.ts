import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Close custom object type that holds the deal risk record (the type's ID in Close).
const CUSTOM_OBJECT_TYPE_ID = "YOUR_CUSTOM_OBJECT_TYPE_ID";
// Close custom object field that receives the intent signals as risk indicators.
const RISK_INDICATORS_FIELD = "YOUR_RISK_INDICATORS_FIELD_KEY";
// Close custom object field that receives the notes.
const RISK_NOTES_FIELD = "YOUR_RISK_NOTES_FIELD_KEY";
// Close custom object list field that receives each intent signal as its own entry.
const RISK_SIGNALS_LIST_FIELD = "YOUR_RISK_SIGNALS_LIST_FIELD_KEY";

const InputSchema = z
  .object({
    email: z.string(),
    intent_signals: z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional(),
    notes: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-deal-risk-profile-from-buyer-intent-feed",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = input.email.trim();
    const signals = Array.isArray(input.intent_signals)
      ? input.intent_signals
      : input.intent_signals
        ? [input.intent_signals]
        : [];

    const leadSearch = await ctx.step("find-close-lead", async () =>
      sdk.runAction({
        appKey: "close",
        actionType: "search",
        actionKey: "search_lead_v6",
        connection: "close",
        inputs: { email },
      }),
    );

    const lead = leadSearch.data?.[0] as { id?: string } | undefined;
    if (!lead?.id) {
      return { skipped: true, reason: "lead-not-found", email };
    }
    const leadId = lead.id;

    const recordSearch = await ctx.step("find-deal-risk-record", async () =>
      sdk.runAction({
        appKey: "close",
        actionType: "search",
        actionKey: "search_custom_objects",
        connection: "close",
        inputs: {
          search_custom_object_type_id: CUSTOM_OBJECT_TYPE_ID,
          search_lead_id: leadId,
          result_limit: "single_result",
        },
      }),
    );

    let record = recordSearch.data?.[0] as { id?: string } | undefined;
    if (!record?.id) {
      const created = await ctx.step("create-deal-risk-record", async () =>
        sdk.runAction({
          appKey: "close",
          actionType: "write",
          actionKey: "new_custom_object_v2",
          connection: "close",
          inputs: {
            lead_id: leadId,
            custom_object_type_id: CUSTOM_OBJECT_TYPE_ID,
            name: `Deal risk profile for ${email}`,
          },
        }),
      );
      record = created.data?.[0] as { id?: string } | undefined;
    }
    if (!record?.id) {
      throw new Error(
        `No deal risk record could be found or created for lead ${leadId}`,
      );
    }
    const customObjectId = record.id;

    const update = await ctx.step("update-deal-risk-record", async () =>
      sdk.runAction({
        appKey: "close",
        actionType: "write",
        actionKey: "update_custom_object",
        connection: "close",
        inputs: {
          custom_object_id: customObjectId,
          custom_object_type_id: CUSTOM_OBJECT_TYPE_ID,
          ...(signals.length
            ? {
                [RISK_INDICATORS_FIELD]: signals.join(", "),
                [RISK_SIGNALS_LIST_FIELD]: signals,
              }
            : {}),
          ...(input.notes ? { [RISK_NOTES_FIELD]: input.notes } : {}),
        },
      }),
    );

    return {
      leadId,
      customObjectId,
      signalCount: signals.length,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
