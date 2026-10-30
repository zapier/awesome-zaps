import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Downstream billing endpoint (your billing workflow's catch-hook URL) that receives each accepted estimate.
const DOWNSTREAM_WEBHOOK_URL = "YOUR_DOWNSTREAM_WEBHOOK_URL";
// QuickBooks estimate status that lets an estimate continue. Estimates in any other status are skipped.
const ACCEPTED_STATUS = "Accepted";
// Separator between line items in the joined description and quantity strings.
const LINE_DELIMITER = "; ";

const InputSchema = z
  .object({
    Id: z.string().nullable().optional(),
    TxnStatus: z.string().nullable().optional(),
    DocNumber: z.string().nullable().optional(),
    TotalAmt: z.number().nullable().optional(),
    CustomerRef__value: z.string().nullable().optional(),
    CustomerRef__name: z.string().nullable().optional(),
    pdf: z.string().nullable().optional(),
    MetaData__LastUpdatedTime: z.string().nullable().optional(),
    "Line[]Description": z.unknown().nullable().optional(),
    "Line[]SalesItemLineDetail__Qty": z.unknown().nullable().optional(),
  })
  .loose();

const isPresent = (value: unknown) =>
  value !== null && value !== undefined && value !== "";

const asList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : isPresent(value) ? [value] : [];

const workflow = defineDurable<unknown, unknown>(
  "send-accepted-estimates-into-billing-pipeline-for-invoicing",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (input.TxnStatus !== ACCEPTED_STATUS) {
      return {
        skipped: true,
        reason: "status-not-accepted",
        status: input.TxnStatus ?? null,
      };
    }
    if (!input.Id) {
      return { skipped: true, reason: "missing-estimate-id" };
    }

    const descriptions = asList(input["Line[]Description"])
      .filter(isPresent)
      .map(String);
    const quantities = asList(input["Line[]SalesItemLineDetail__Qty"])
      .filter(isPresent)
      .map(String);

    const posted = await ctx.step(
      "post-accepted-estimate-to-billing",
      async () =>
        sdk.runAction({
          appKey: "webhook",
          actionType: "write",
          actionKey: "post",
          inputs: {
            url: DOWNSTREAM_WEBHOOK_URL,
            payload_type: "form",
            unflatten: "no",
            extract_variables: "no",
            data: {
              reference: input.Id,
              doc_number: input.DocNumber ?? null,
              customer_id: input.CustomerRef__value ?? null,
              customer_name: input.CustomerRef__name ?? null,
              total_amount: input.TotalAmt ?? null,
              document_url: input.pdf ?? null,
              acceptance_status: input.TxnStatus,
              acceptance_time: input.MetaData__LastUpdatedTime ?? null,
              line_descriptions: descriptions.join(LINE_DELIMITER),
              line_quantities: quantities.join(LINE_DELIMITER),
            },
          },
        }),
    );

    return {
      estimateId: input.Id,
      lineCount: descriptions.length,
      posted: posted.data?.[0] ?? null,
    };
  },
);

export default workflow;
