---
name: create-po-records-from-new-purchase-order-pd-fs
description: Build a Zap on Zapier that reads each new purchase order PDF dropped into a OneDrive folder, pulls out the company name and PO number, and adds one record per PO to a Zapier Table, skipping POs already logged. Use when a finance or procurement team keeps a PO register in a table and wants new POs logged without retyping them.
license: MIT
metadata:
  author: zapier
  summary: "When a purchase order PDF lands in your OneDrive folder, its company and PO number are read and logged as one row in your PO table, with a link back to the file."
  apps: "OneDrive, PDF4me, ChatGPT (OpenAI), Zapier Tables"
  category: "Finance"
  job: "Procure to pay"
  source: "https://zapier.com/automations/finance/procure-to-pay/purchase-order-management/create-po-records-from-new-purchase-order-pd-fs"
---

# Create PO records from new purchase orders

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-po-records-from-new-purchase-order-pd-fs. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a file is created or changed in the chosen OneDrive folder (`onedrive`, `new_or_updated_file`). The trigger brings the file's name, download link and date.
2. **PDF4me** (`pdf4me`) extracts the text of the PDF, page by page.
3. **ChatGPT** (`chatgpt`) reads that text and returns the company name and PO number. Missing values come back as `Not Found`.
4. **Filter:** the run stops if there is no PO number (or it is `Not Found`).
5. **Zapier Tables** (`zapier-tables`) looks for an existing record with the same PO number. If one exists, the run stops, so a PO already logged is skipped, never overwritten.
6. **Zapier Tables** creates a record with the file's date, a link to the file, the company and the PO number.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | Where       | What goes there                                    |
| -------------------------- | ----------- | -------------------------------------------------- |
| `REPLACE_PO_TABLE_ID`      | `config.ts` | The Zapier Table that holds the PO register        |
| `REPLACE_DATE_FIELD`       | `config.ts` | The table field key that gets the file's date      |
| `REPLACE_ATTACHMENT_FIELD` | `config.ts` | The table field key that gets the link to the file |
| `REPLACE_COMPANY_FIELD`    | `config.ts` | The table field key that gets the company name     |
| `REPLACE_PO_NUMBER_FIELD`  | `config.ts` | The table field key that gets the PO number        |

Also ask:

- Which OneDrive folder holds the purchase orders? Set it as the trigger's folder; blank watches the root.
- Should PO numbers match exactly, or ignoring case and spaces? The workflow matches the PO number as extracted, so ignoring case and spaces needs a code change.
- Connect PDF4me, ChatGPT (OpenAI) and OneDrive in the user's account. The Zap can't run without all three.

Review the default `NOT_FOUND` (`"Not Found"`) with them. It is the value the prompt writes for a missing field, so keep it unless the prompt changes.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `pdf4me` (PDF4me, for the text extraction), `chatgpt` (ChatGPT, for reading the PO fields), and `zapier-tables` (the Zapier Tables account that holds the PO register) to the user's connections. Bind `onedrive` to the user's OneDrive connection for the trigger. Every app here needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-or-updated-file.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a one-page PDF in a folder the user owns. Its text should contain a company name and a PO number, such as `Northwind Traders` and `PO-2026-0412`.

Check that:

- The run finds no existing record for that PO number, and creates one.
- The new record has the file's date, a link to the file, the company and the PO number.
- A second run with the same file skips with `duplicate-po`.
- A PDF with no PO number skips with `po-number-not-found`, and writes nothing.

If run-status tools aren't available, check the result in Zapier Tables directly. Then publish, confirm the trigger is active, and tell the user where to put their PO files. The user deletes the test records and the test file, not the agent.

## Notes

- Zapier Tables field keys are set by the table. Check them against the table before the first run, since a wrong key writes to the wrong column.
- The ChatGPT step returns text; the code reads it as JSON with keys `company` and `po_number`. If the model returns other text, both values become `Not Found`.
- A re-saved PO fires the trigger again, and the duplicate check skips it.
- To extend it: send a Slack or email message for human review when a duplicate PO is found, or add a check for other placeholder values beyond `Not Found`.
