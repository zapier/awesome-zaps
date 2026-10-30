---
name: create-po-records-from-new-purchase-order-pd-fs
description: Build a Zapier Next Gen Zap that reads each new purchase order PDF dropped into a OneDrive folder, pulls out the company name and PO number, and adds one record per PO to a Zapier Table, skipping POs already logged. Use when a finance or procurement team keeps a PO register in a table and wants new POs logged without retyping them.
metadata:
  author: zapier
  summary: "When a purchase order PDF lands in your OneDrive folder, its company and PO number are read and logged as one row in your PO table, with a link back to the file."
  apps: "OneDrive, PDF4me, ChatGPT (OpenAI), Zapier Tables"
  category: "Finance"
  job: "Procure to pay"
  source: "https://zapier.com/automations/finance/procure-to-pay/purchase-order-management/create-po-records-from-new-purchase-order-pd-fs"
---

# Create PO records from new purchase orders

## What it does

1. **Trigger:** a file is created or changed in the chosen OneDrive folder (`New or Updated File`). The spec says "new file"; the closest OneDrive trigger that takes a folder is this one, so a re-saved PO can fire it again.
2. **PDF4me** extracts the text of the PDF, page by page.
3. **ChatGPT** reads that text and returns the company name and PO number. Missing values come back as `Not Found`.
4. **Filter:** the run stops if there is no PO number (or it is `Not Found`).
5. **Zapier Tables** looks for an existing record with the same PO number. If one exists, the run stops.
6. **Zapier Tables** creates a record with the file's date, a link to the file, the company and the PO number.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** OneDrive, `New or Updated File` (`new_or_updated_file`). Set the folder parameter to the PO folder; it is blank here, which watches the root folder. It needs the user's OneDrive connection.
2. **Connections** (each alias in the code is the app's slug):
   - `pdf4me`: the user's PDF4me connection. Not bound in this draft.
   - `chatgpt`: the user's ChatGPT (OpenAI) connection. Not bound in this draft.
   - `zapier-tables`: the user's Zapier Tables connection. Bound in this draft.
   - OneDrive: the trigger's connection. Not bound in this draft.
3. **Constants:**
   - `PO_TABLE_ID`: the ID of the Zapier Table that holds the PO register.
   - `DATE_FIELD`, `ATTACHMENT_FIELD`, `COMPANY_FIELD`, `PO_NUMBER_FIELD`: the table's field keys, not header names. They are placeholders here.
   - `NOT_FOUND`: the value the prompt uses for a missing field. Defaults to `"Not Found"`.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user where to put their PO files.

## Ask the user

- Which OneDrive folder holds the purchase orders? (Blank watches the root.)
- Which Zapier Table holds the PO register, and what are its field keys for the date, file link, company and PO number?
- Should PO numbers be matched exactly, or ignoring case and spaces?
- Connect PDF4me, ChatGPT (OpenAI) and OneDrive in the user's account. None of them is connected here.

## Test

Testing needs the OneDrive trigger to fire, which needs a OneDrive connection, and the PDF4me and ChatGPT steps need their own. The sample to use once those are connected is a one-page PDF whose text contains a company name and a PO number, such as `PO-2026-0412` and `Northwind Traders`, in a folder the user owns.

Check that:

- The run finds no existing record for that PO number, and creates one.
- The new record has the file's date, a link to the file, the company and the PO number.
- A second run with the same file skips with `duplicate-po`.
- A PDF with no PO number skips with `po-number-not-found`, and writes nothing.

## Customize

- **Filter out "Not Found":** already done by default, since a missing PO number stops the run. A separate check for other placeholder values can be added.
- **Alert fulfillment on a duplicate PO:** when the lookup finds a match, send a Slack or email message for human review.

## Notes

- Zapier Tables field keys are set by the table. Check them against the table before the first run, since a wrong key writes to the wrong column.
- The ChatGPT step returns text; the code reads it as JSON with keys `company` and `po_number`. If the model returns other text, both values become `Not Found`.
- Never commit a real table ID or folder path. The file is a template.
