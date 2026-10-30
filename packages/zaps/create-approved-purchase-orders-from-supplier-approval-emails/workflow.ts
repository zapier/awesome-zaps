import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID of the central PO register (the long ID in the table's URL).
const PO_TABLE_ID = "YOUR_PO_TABLE_ID";
// Table field keys: f1 = PO number, f2 = vendor name, f3 = amount, f4 = description, f5 = status.
const PO_NUMBER_FIELD = "f1";
const VENDOR_NAME_FIELD = "f2";
const AMOUNT_FIELD = "f3";
const DESCRIPTION_FIELD = "f4";
const STATUS_FIELD = "f5";
// QuickBooks Online product/service ID each purchase order line is booked against.
const QBO_ITEM_ID = "YOUR_QBO_ITEM_ID";
// Mailbox that gets a note when no PO row or vendor matches, and that receipts go to.
const PROCUREMENT_EMAIL = "YOUR_PROCUREMENT_EMAIL";

const InputSchema = z
  .object({
    id: z.string(),
    subject: z.string().nullable().optional(),
    body__content: z.string().nullable().optional(),
    from__emailAddress__name: z.string().nullable().optional(),
    from__emailAddress__address: z.string().nullable().optional(),
  })
  .loose();

const APPROVAL_PROMPT =
  "Read the supplier or approver email. Decide the PO status: approved for a simple affirmative reply, denied for a rejection, changed when the reply asks for different materials or quantities. Extract the PO number exactly as written, the updated material list if status is changed, and the approver's name from the sender. If no PO number is present, leave po_number empty.";

// Reads one column of a Zapier Tables record, whether it arrives nested (old.data.f2) or flat (old__data__f2).
const tableField = (record: Record<string, unknown>, key: string): string => {
  const nested = (record.old as { data?: Record<string, unknown> } | undefined)
    ?.data?.[key];
  const flat = record[`old__data__${key}`];
  return String(nested ?? flat ?? "").trim();
};

const notifyProcurement = (subject: string, body: string) =>
  sdk.runAction({
    appKey: "microsoft-outlook",
    actionType: "write",
    actionKey: "send_email",
    connection: "microsoft-outlook",
    inputs: {
      recipients: PROCUREMENT_EMAIL,
      subject,
      body,
      bodyFormat: "Text",
    },
  });

const replyToEmail = (emailId: string, comment: string) =>
  sdk.runAction({
    appKey: "microsoft-outlook",
    actionType: "write",
    actionKey: "reply_to_email",
    connection: "microsoft-outlook",
    inputs: { email_id: emailId, comment },
  });

const workflow = defineDurable<unknown, unknown>(
  "create-approved-purchase-orders-from-supplier-approval-emails",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const parsedResult = await ctx.step("parse-approval-reply", async () =>
      sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        connection: "ai",
        inputs: {
          model_id: "premium/auto",
          authentication_id: "0",
          instructions: APPROVAL_PROMPT,
          inputFields: {
            from_name: input.from__emailAddress__name ?? "",
            subject: input.subject ?? "",
            body: input.body__content ?? "",
          },
          includeWorkflowData: false,
          outputFields: [
            {
              name: "status",
              type: "category_single",
              isRequired: true,
              options: ["approved", "denied", "changed"],
            },
            { name: "po_number", type: "text", isRequired: false },
            { name: "updated_materials", type: "text", isRequired: false },
            { name: "approver_name", type: "text", isRequired: false },
          ],
          isOutputArray: false,
        },
      }),
    );

    const reply = parsedResult.data?.[0] as
      | {
          status?: string;
          po_number?: string | null;
          updated_materials?: string | null;
          approver_name?: string | null;
        }
      | undefined;
    const status = reply?.status ?? "unclear";
    const poNumber = reply?.po_number?.trim();
    const approver =
      reply?.approver_name?.trim() ||
      input.from__emailAddress__name ||
      "the approver";
    if (!poNumber) {
      return { skipped: true, reason: "no-po-number" };
    }
    // Only an approved or changed reply creates a purchase order.
    if (status !== "approved" && status !== "changed") {
      return { skipped: true, reason: `status-${status}`, poNumber };
    }

    // Stop, create nothing, and tell procurement when the PO is not in the register.
    const found = await ctx.step("find-po-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: PO_TABLE_ID,
          filter_count: "1",
          use_stored_order: false,
          field_data_key: PO_NUMBER_FIELD,
          operator: "exact",
          lookup_value: poNumber,
        },
      }),
    );

    const record = found.data?.[0] as Record<string, unknown> | undefined;
    if (!record) {
      await ctx.step("notify-procurement-no-po", async () =>
        notifyProcurement(
          `No PO row for ${poNumber}`,
          `An approval reply for PO ${poNumber} arrived, but no matching row is in the PO register. No purchase order was created.`,
        ),
      );
      return { skipped: true, reason: "po-not-found", poNumber };
    }

    const vendorName = tableField(record, VENDOR_NAME_FIELD);
    const vendor = await ctx.step("find-qbo-vendor", async () =>
      sdk.runAction({
        appKey: "quickbooks",
        actionType: "search",
        actionKey: "vendor",
        connection: "quickbooks",
        inputs: { name: vendorName },
      }),
    );

    const vendorId = vendor.data?.[0]?.id;
    if (!vendorId) {
      await ctx.step("notify-procurement-no-vendor", async () =>
        notifyProcurement(
          `No QuickBooks vendor for PO ${poNumber}`,
          `PO ${poNumber} was approved, but no QuickBooks vendor named "${vendorName}" was found. No purchase order was created.`,
        ),
      );
      return {
        skipped: true,
        reason: "vendor-not-found",
        poNumber,
        vendorName,
      };
    }

    const orderDate = await ctx.step("capture-order-date", async () =>
      new Date().toISOString().slice(0, 10),
    );

    const materialNote =
      status === "changed" && reply?.updated_materials
        ? `Updated materials: ${reply.updated_materials}`
        : null;
    const description = [tableField(record, DESCRIPTION_FIELD), materialNote]
      .filter(Boolean)
      .join("\n");
    const amount = Number.parseFloat(tableField(record, AMOUNT_FIELD) || "0");

    const purchaseOrder = await ctx.step(
      "create-qbo-purchase-order",
      async () =>
        sdk.runAction({
          appKey: "quickbooks",
          actionType: "write",
          actionKey: "purchase_order",
          connection: "quickbooks",
          inputs: {
            vendor: vendorId,
            date: orderDate,
            doc_number: poNumber,
            private_note: description,
            status: "Open",
            item_details_item: QBO_ITEM_ID,
            item_details_quantity: 1,
            item_details_amount: amount,
            item_details_description: description,
          },
        }),
    );

    // Mark the PO row approved (or changed) so the register reflects the decision.
    await ctx.step("update-po-record-status", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "update_record",
        connection: "zapier-tables",
        inputs: {
          table_id: PO_TABLE_ID,
          record_id: record.record_id,
          [`new__data__${STATUS_FIELD}`]:
            status === "changed"
              ? "Changed, PO created"
              : "Approved, PO created",
        },
      }),
    );

    const replied = await ctx.step("send-approval-reply", async () =>
      replyToEmail(
        input.id,
        `Thanks ${approver}. PO ${poNumber} is approved and a purchase order has been created in QuickBooks. Send receipts to ${PROCUREMENT_EMAIL}.`,
      ),
    );

    return {
      poNumber,
      status,
      vendorId,
      purchaseOrder: purchaseOrder.data?.[0] ?? null,
      replied: replied.data?.[0] ?? null,
    };
  },
);

export default workflow;
