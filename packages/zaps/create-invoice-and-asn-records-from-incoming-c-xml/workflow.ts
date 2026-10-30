import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Drive folder ID where each raw cXML file is saved (the long ID in the folder's URL). Needs a Google Drive connection.
const DRIVE_FOLDER_ID = "YOUR_DRIVE_FOLDER_ID";
// Zapier Tables table ID that holds one row per invoice or ASN.
const TABLE_ID = "YOUR_TABLE_ID";
// Xero organization that invoice lookups run against (organization name or ID).
const XERO_ORGANIZATION = "YOUR_XERO_ORGANIZATION";
// pdfFiller document ID of the ASN PDF template.
const ASN_TEMPLATE_ID = "YOUR_PDFFILLER_TEMPLATE_ID";

const MESSAGE_ROOTS = [
  { root: "InvoiceDetailRequest", messageType: "Invoice" },
  { root: "ShipNoticeRequest", messageType: "ASN" },
  { root: "ConfirmationRequest", messageType: "POAck" },
];

// The catch hook delivers the raw body; accept a bare string or an object with a body field.
function extractXml(rawInput: unknown): string {
  if (typeof rawInput === "string") {
    return rawInput;
  }
  const body = (rawInput as { body?: unknown } | null)?.body;
  return typeof body === "string" ? body : "";
}

function firstMatch(xml: string, pattern: RegExp): string | null {
  return xml.match(pattern)?.[1] ?? null;
}

function parseCxml(xml: string) {
  const root = MESSAGE_ROOTS.find(({ root }) => xml.includes(`<${root}`));
  return {
    messageType: root?.messageType ?? "Unknown",
    orderReference: firstMatch(xml, /orderID="([^"]+)"/),
    documentId: firstMatch(
      xml,
      /(?:invoiceID|confirmationID|shipNoticeID)="([^"]+)"/,
    ),
    amount: firstMatch(xml, /<Money[^>]*>([\d.]+)<\/Money>/),
    taxCity: firstMatch(xml, /<Tax>[\s\S]*?<City>([^<]+)<\/City>/),
    shipCity: firstMatch(xml, /<ShipTo>[\s\S]*?<City>([^<]+)<\/City>/),
  };
}

const workflow = defineDurable<unknown, unknown>(
  "create-invoice-and-asn-records-from-incoming-c-xml",
  async (ctx, rawInput) => {
    const xml = extractXml(rawInput);
    if (!xml) {
      return { skipped: true, reason: "no-xml-body" };
    }
    const doc = parseCxml(xml);

    const timestamp = await ctx.step("capture-timestamp", async () =>
      new Date().toISOString().replace(/[:.]/g, "-"),
    );

    const rawFile = await ctx.step("save-raw-cxml-to-drive", async () =>
      sdk.runAction({
        appKey: "google-drive",
        actionType: "write",
        actionKey: "newtxtfile",
        connection: "google-drive",
        inputs: {
          file: xml,
          title: `${doc.messageType}-${doc.orderReference ?? "no-order"}-${timestamp}.xml`,
          folder: DRIVE_FOLDER_ID,
          convert: false,
        },
      }),
    );
    const fileLink = rawFile.data[0]?.webViewLink ?? "";

    const match = await ctx.step("find-table-record", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          filter_count: "2",
          use_stored_order: false,
          field_data_key: "order_reference",
          field_data_key_2: "invoice_id",
          order_reference: doc.orderReference ?? "",
          invoice_id: doc.documentId ?? "",
        },
      }),
    );

    const existing = match.data[0] ?? null;
    let recordId = existing?.record_id ?? null;
    if (!existing) {
      const created = await ctx.step("create-table-record", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "create_record",
          connection: "zapier-tables",
          inputs: {
            table_id: TABLE_ID,
            new__data__f1: doc.orderReference ?? "",
            new__data__f2: doc.documentId ?? "",
            new__data__f3: doc.messageType,
            new__data__f4: doc.amount ?? "",
            new__data__f5: doc.taxCity ?? "",
            new__data__f6: doc.shipCity ?? "",
            new__data__f7: fileLink,
          },
        }),
      );
      recordId = created.data[0]?.record_id ?? null;
    }

    const invoiceId = doc.documentId;
    let xeroInvoice = null;
    if (doc.messageType === "Invoice" && invoiceId) {
      xeroInvoice = await ctx.step("look-up-xero-invoice", async () =>
        sdk.runAction({
          appKey: "xero",
          actionType: "search",
          actionKey: "find_invoice_by_id",
          connection: "xero",
          inputs: {
            organization: XERO_ORGANIZATION,
            invoice_id: invoiceId,
            include_pdf: false,
            include_online_url: false,
          },
        }),
      );
    }

    let asnPdf = null;
    if (doc.messageType === "ASN") {
      asnPdf = await ctx.step("generate-asn-pdf", async () =>
        sdk.runAction({
          appKey: "pdffiller",
          actionType: "write",
          actionKey: "download_template",
          connection: "pdffiller",
          inputs: {
            template_id: ASN_TEMPLATE_ID,
            template_name: `ASN-${doc.orderReference ?? "no-order"}-${timestamp}`,
          },
        }),
      );
    }

    return {
      messageType: doc.messageType,
      orderReference: doc.orderReference,
      recordId,
      matchedExisting: Boolean(existing),
      fileLink,
      xeroChecked: xeroInvoice !== null,
      asnPdfRequested: asnPdf !== null,
    };
  },
);

export default workflow;
