import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID for the central PO tracking table.
const PO_TABLE_ID = "YOUR_TABLE_ID";
// Table field keys, one per value written to a record. Use the keys from your table.
const DATE_FIELD = "YOUR_DATE_FIELD_KEY";
const ATTACHMENT_FIELD = "YOUR_ATTACHMENT_FIELD_KEY";
const COMPANY_FIELD = "YOUR_COMPANY_FIELD_KEY";
const PO_NUMBER_FIELD = "YOUR_PO_NUMBER_FIELD_KEY";
// Value the extraction prompt returns when a field is missing. Treated as absent.
const NOT_FOUND = "Not Found";

const InputSchema = z
  .object({
    file: z
      .object({
        name: z.string().nullable().optional(),
        // Download link for the PDF. Confirm this key against a real OneDrive trigger sample.
        download_url: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    created_at: z.string().nullable().optional(),
  })
  .loose();

function parseFields(reply: string): { company: string; poNumber: string } {
  try {
    const value = JSON.parse(reply) as { company?: string; po_number?: string };
    return {
      company: value.company ?? NOT_FOUND,
      poNumber: value.po_number ?? NOT_FOUND,
    };
  } catch {
    return { company: NOT_FOUND, poNumber: NOT_FOUND };
  }
}

const workflow = defineDurable<unknown, unknown>(
  "create-po-records-from-new-purchase-order-pd-fs",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const fileUrl = input.file?.download_url ?? "";
    const fileName = input.file?.name ?? "purchase-order.pdf";
    if (!fileUrl) {
      return { skipped: true, reason: "no-file-url" };
    }

    const extracted = await ctx.step("extract-pdf-text", async () =>
      sdk.runAction({
        appKey: "pdf4me",
        actionType: "write",
        actionKey: "ExtractText",
        connection: "pdf4me",
        inputs: { fileUrl, fName: fileName, extractTextMode: "pagewise" },
      }),
    );
    const pdfText = JSON.stringify(extracted.data[0] ?? {});

    const fields = await ctx.step("extract-po-fields", async () =>
      sdk.runAction({
        appKey: "chatgpt",
        actionType: "write",
        actionKey: "conversation_responses_api",
        connection: "chatgpt",
        inputs: {
          model: "gpt-4o",
          instructions:
            'Return only JSON with keys "company" and "po_number" taken from the purchase order text. Use "Not Found" for any value that is missing.',
          user_message: pdfText,
          response_format: "text",
        },
      }),
    );
    const { company, poNumber } = parseFields(
      String(fields.data[0]?.output ?? ""),
    );

    if (!poNumber || poNumber === NOT_FOUND) {
      return { skipped: true, reason: "po-number-not-found", fileName };
    }

    // Dedupe on PO number: create a record only when no existing record matches.
    const existing = await ctx.step("find-existing-po-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: { table_id: PO_TABLE_ID, [PO_NUMBER_FIELD]: poNumber },
      }),
    );
    if (existing.data.length > 0) {
      return { skipped: true, reason: "duplicate-po", poNumber };
    }

    const created = await ctx.step("create-po-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: PO_TABLE_ID,
          [DATE_FIELD]: input.created_at ?? "",
          [ATTACHMENT_FIELD]: fileUrl,
          [COMPANY_FIELD]: company,
          [PO_NUMBER_FIELD]: poNumber,
        },
      }),
    );

    return { poNumber, company, record: created.data[0] ?? null };
  },
);

export default workflow;
