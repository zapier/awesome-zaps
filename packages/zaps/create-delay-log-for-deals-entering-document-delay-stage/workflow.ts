import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Pipedrive stage ID of the document-delay stage. Deals moving into any other stage are skipped.
const DELAY_STAGE_ID = "YOUR_DELAY_STAGE_ID";
// Zapier Tables table ID of the delay log.
const DELAY_LOG_TABLE_ID = "YOUR_TABLE_ID";
// Value written to the Triage status column of each new row.
const INITIAL_TRIAGE_STATUS = "Open";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    stage_id: z.union([z.string(), z.number()]).nullable().optional(),
    update_time: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-delay-log-for-deals-entering-document-delay-stage",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const dealId = String(input.id ?? "").trim();
    const stageId = String(input.stage_id ?? "").trim();

    if (!dealId) {
      return { skipped: true, reason: "no-deal-id" };
    }
    if (stageId !== DELAY_STAGE_ID) {
      return { skipped: true, reason: "not-delay-stage", stageId };
    }

    const existing = await ctx.step("find-delay-log-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: DELAY_LOG_TABLE_ID,
          filter_count: "1",
          field_data_key: "f1",
          operator: "exact",
          lookup_value: dealId,
        },
      }),
    );

    if (existing.data?.length) {
      return { skipped: true, reason: "deal-already-logged", dealId };
    }

    const loggedAt = await ctx.step("capture-logged-at", async () =>
      new Date().toISOString(),
    );
    const updatedAt = input.update_time ?? loggedAt;

    const row = await ctx.step("create-delay-log-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: DELAY_LOG_TABLE_ID,
          new__data__f1: dealId,
          new__data__f2: updatedAt,
          new__data__f3: stageId,
          new__data__f4: INITIAL_TRIAGE_STATUS,
        },
      }),
    );

    return { dealId, updatedAt, logged: row.data?.[0] ?? null };
  },
);

export default workflow;
