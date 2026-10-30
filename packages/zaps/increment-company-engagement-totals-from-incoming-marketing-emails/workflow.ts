import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID of the tracking table (the ID in the table's URL).
const TABLE_ID = "YOUR_TABLE_ID";
// Field key of the Company ID column. Matched on when looking for a company's row.
const COMPANY_ID_FIELD = "data__f1";
// Field key of the Engagement Count column (a number field).
const ENGAGEMENT_COUNT_FIELD = "data__f2";
// How much each engagement adds to a company's count. Default is 1 per event.
const INCREMENT_AMOUNT = "1";

const InputSchema = z
  .object({
    associatedCompanyIds: z
      .array(z.union([z.string(), z.number()]))
      .nullable()
      .optional(),
  })
  .loose();

type EngagementResult = {
  companyId: string;
  action: "incremented" | "created" | "failed";
  recordId?: string;
  error?: string;
};

const workflow = defineDurable<unknown, unknown>(
  "increment-company-engagement-totals-from-incoming-marketing-emails",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const companyIds = [
      ...new Set(
        (input.associatedCompanyIds ?? [])
          .map((id) => String(id).trim())
          .filter(Boolean),
      ),
    ];

    if (companyIds.length === 0) {
      return { skipped: true, reason: "no-company-ids" };
    }

    const results: EngagementResult[] = [];
    for (const [index, companyId] of companyIds.entries()) {
      try {
        const lookup = await ctx.step(`find-company-row-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "search",
            actionKey: "find_record",
            connection: "zapier-tables",
            inputs: {
              table_id: TABLE_ID,
              filter_count: "1",
              field_data_key: COMPANY_ID_FIELD,
              operator: "exact",
              lookup_value: companyId,
            },
          }),
        );

        const row = lookup.data?.[0] as { record_id?: string } | undefined;
        if (row?.record_id) {
          const recordId = row.record_id;
          await ctx.step(`increment-company-row-${index}`, async () =>
            sdk.runAction({
              appKey: "zapier-tables",
              actionType: "write",
              actionKey: "increment_value",
              connection: "zapier-tables",
              inputs: {
                table_id: TABLE_ID,
                record_id: recordId,
                field_data_key: ENGAGEMENT_COUNT_FIELD,
                increment_amount: INCREMENT_AMOUNT,
              },
            }),
          );
          results.push({ companyId, action: "incremented", recordId });
        } else {
          const created = await ctx.step(
            `create-company-row-${index}`,
            async () =>
              sdk.runAction({
                appKey: "zapier-tables",
                actionType: "write",
                actionKey: "create_record",
                connection: "zapier-tables",
                inputs: {
                  table_id: TABLE_ID,
                  new__data__f1: companyId,
                  new__data__f2: INCREMENT_AMOUNT,
                },
              }),
          );
          results.push({
            companyId,
            action: "created",
            recordId: (created.data?.[0] as { record_id?: string } | undefined)
              ?.record_id,
          });
        }
      } catch (error) {
        results.push({ companyId, action: "failed", error: String(error) });
      }
    }

    return {
      results,
      failed: results.filter((result) => result.action === "failed").length,
    };
  },
);

export default workflow;
