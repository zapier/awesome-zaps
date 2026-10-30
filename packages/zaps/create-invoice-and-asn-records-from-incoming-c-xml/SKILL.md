---
name: create-invoice-and-asn-records-from-incoming-c-xml
description: Build a Zapier Next Gen Zap that receives a supplier cXML packet by webhook, saves the raw XML to Google Drive, and logs each invoice or ship notice in a Zapier Table, with a Xero invoice lookup and ASN PDF generation. Use when an accounts-payable team receives supplier cXML invoices, order confirmations or ship notices and wants them filed and logged without manual entry.
metadata:
  author: zapier
  summary: "When a supplier sends a cXML invoice or ship notice, the raw file is saved to Drive and a matching row is logged in your invoice table, with ASN paperwork generated."
  apps: "Webhooks by Zapier, Google Drive, Zapier Tables, Xero, pdfFiller"
  category: "Finance"
  job: "Accounts payable"
  source: "https://zapier.com/automations/finance/accounts-payable/invoice-processing-management/create-invoice-and-asn-records-from-incoming-c-xml"
---

# Create invoice and ASN records from incoming cXML

## What it does

1. **Trigger:** a raw cXML packet arrives at a Webhooks by Zapier catch hook.
2. **Code** reads the message type from the root element (`InvoiceDetailRequest` is Invoice, `ShipNoticeRequest` is ASN, `ConfirmationRequest` is POAck) and pulls the order reference, the invoice or confirmation ID, the first amount, and the tax and ship-to cities.
3. **Google Drive** saves the raw XML as a new file in your folder, named with the message type, order reference and a timestamp.
4. **Zapier Tables** looks for a row with the same order reference and invoice ID. If there is none, it creates one with the file link.
5. **Xero** looks up the invoice by ID for Invoice messages. It does not create invoices.
6. **pdfFiller** downloads your ASN template for ASN messages. POAck messages stop after the table row.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Raw Hook (`webhook`, action `hook_raw`). It needs no connection, so its `authentication_id` is `null`. The raw body is used because the spec receives raw cXML.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: a Google Drive connection for the account that owns the invoice folder.
   - `zapier-tables`: the Zapier Tables connection that owns the invoice table.
   - `xero`: a Xero connection for the organization that holds the invoices.
   - `pdffiller`: a pdfFiller connection that can see the ASN template.
3. **Constants:**
   - `DRIVE_FOLDER_ID`: the folder where raw cXML files are saved. It is the long ID in the folder's URL.
   - `TABLE_ID`: the Zapier Tables table that holds one row per invoice or ASN. The table needs these fields: `order_reference`, `invoice_id`, `message_type`, `amount` (number), `tax_city`, `ship_city`, `file_link`.
   - `XERO_ORGANIZATION`: the Xero organization name or ID.
   - `ASN_TEMPLATE_ID`: the pdfFiller document ID of the ASN template.

## Ask the user

- Which Drive folder holds the raw cXML files, and which Zapier Table holds the invoice records?
- Which Xero organization holds the invoices, and which pdfFiller document is the ASN template?
- Should a matched row be updated with the new file link, or left as it is? The draft leaves matched rows unchanged.
- What should a POAck (order confirmation) do? The draft only logs it to the table.

## Test

No test was run. To test, send this sample to the draft as its input, with a draft test run, after the connections above are bound. Use only a test invoice, and name it with `[install-test]`:

```xml
<cXML payloadID="[install-test]-1" timestamp="2026-10-29T10:00:00-07:00">
  <Request>
    <InvoiceDetailRequest>
      <InvoiceDetailRequestHeader invoiceID="[install-test]-INV-1001" invoiceDate="2026-10-29T10:00:00-07:00" purpose="standard" operation="new">
        <InvoiceDetailOrderInfo><OrderReference orderID="[install-test]-PO-5001"/></InvoiceDetailOrderInfo>
        <InvoiceDetailSummary><NetAmount><Money currency="USD">100.00</Money></NetAmount></InvoiceDetailSummary>
        <Tax><Money currency="USD">8.00</Money><TaxDetail><TaxLocation><City>Austin</City></TaxLocation></TaxDetail></Tax>
        <ShipTo><Address><City>Denver</City></Address></ShipTo>
      </InvoiceDetailRequestHeader>
    </InvoiceDetailRequest>
  </Request>
</cXML>
```

Check: one new row in the table with `message_type` Invoice, `order_reference` and `invoice_id` set, `amount` 100.00, and the file link filled. Check that one raw file appears in the Drive folder with the test invoice's XML. Then delete the test row and file.

## Customize

- **Zoho CRM lookup and Gmail alert:** for unmatched orders, look up the order in Zoho CRM and email sales or procurement.
- **Xero tax rate lookup:** extend the Xero step to look up regional tax rates for the tax city.

## Notes

- The spec's Sub-Zap is built as steps in the same workflow, not a separate workflow.
- pdfFiller's download action returns the blank template. It does not fill the template from the cXML, so the ASN PDF will not contain the shipment data until a fill step is added.
- The first `Money` value in the file is used as the amount, which can be a line item rather than the invoice total.
- Never commit real Drive, Table, Xero or pdfFiller IDs.
