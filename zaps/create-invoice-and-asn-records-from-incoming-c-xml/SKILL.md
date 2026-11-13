---
name: create-invoice-and-asn-records-from-incoming-c-xml
description: Build a Zap on Zapier that receives a supplier cXML packet by webhook, saves the raw XML to Google Drive, and logs each invoice or ship notice in a Zapier Table, with a Xero invoice lookup and ASN PDF generation. Use when an accounts-payable team receives supplier cXML invoices, order confirmations or ship notices and wants them filed and logged without manual entry.
license: MIT
metadata:
  author: zapier
  summary: "When a supplier sends a cXML invoice or ship notice, the raw file is saved to Drive and a matching row is logged in your invoice table, with ASN paperwork generated."
  apps: "Webhooks by Zapier, Google Drive, Zapier Tables, Xero, pdfFiller"
  category: "Finance"
  job: "Accounts payable"
  source: "https://zapier.com/automations/finance/accounts-payable/invoice-processing-management/create-invoice-and-asn-records-from-incoming-c-xml"
---

# Create invoice and ASN records from incoming cXML

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-invoice-and-asn-records-from-incoming-c-xml. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a raw cXML packet arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_raw`).
2. **Code** reads the message type from the root element (`InvoiceDetailRequest` is Invoice, `ShipNoticeRequest` is ASN, `ConfirmationRequest` is POAck) and pulls the order reference, the invoice or confirmation ID, the first amount, and the tax and ship-to cities.
3. **Google Drive** saves the raw XML as a new file in your folder, named with the message type, order reference and a timestamp.
4. **Zapier Tables** looks for a row with the same order reference and invoice ID. If there is none, it creates one with the file link.
5. **Xero** looks up the invoice by ID for Invoice messages.
6. **pdfFiller** downloads your ASN template for ASN messages. POAck messages stop after the table row.

The Zap never creates invoices in Xero, and it leaves a matched table row unchanged.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DRIVE_FOLDER_ID`   | The Google Drive folder where each raw cXML file is saved, named by the user and looked up with their Google Drive connection                                                     |
| `TABLE_ID`          | The Zapier Table with one row per invoice or ASN. It needs these fields: `order_reference`, `invoice_id`, `message_type`, `amount` (number), `tax_city`, `ship_city`, `file_link` |
| `XERO_ORGANIZATION` | The Xero organization that holds the invoices, by name or ID                                                                                                                      |
| `ASN_TEMPLATE_ID`   | The pdfFiller document ID of the ASN PDF template                                                                                                                                 |

Also review the defaults with them: a matched row is left unchanged, and a POAck (order confirmation) is only logged to the table.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` to the Google Drive connection for the account that owns the invoice folder, `zapier-tables` to the Zapier Tables connection that owns the invoice table, `xero` to the Xero connection for the organization that holds the invoices, and `pdffiller` to a pdfFiller connection that can see the ASN template. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook-raw.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger, if it has one, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with this sample as its input, after the connections are bound. Use only a test invoice, named with `[install-test]`:

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

Check that one new row appears in the table with `message_type` Invoice, `order_reference` and `invoice_id` set, `amount` 100.00, and the file link filled. Check that one raw file appears in the Drive folder with the test invoice's XML. If run-status tools aren't available, check the result in Zapier Tables and Google Drive directly. Ask the user to delete the test row and file, not the agent.

## Notes

- For unmatched orders, extend the Zap to look up the order in Zoho CRM and email sales or procurement.
- To look up regional tax rates for the tax city, extend the Xero step.
- The spec's Sub-Zap is built as steps in the same workflow, not a separate workflow.
- pdfFiller's download action returns the blank template and does not fill it from the cXML, so the ASN PDF will not contain the shipment data until a fill step is added.
- The first `Money` value in the file is used as the amount, which can be a line item rather than the invoice total.
- Never commit real Drive, Table, Xero or pdfFiller IDs.
