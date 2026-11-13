---
name: create-contractor-bid-emails-from-updated-sheet-rows
description: Build a Zap on Zapier that, when a bid request row in a project sheet is updated, creates a draft email to the contractor with the project details and marks the row as drafted so it is not drafted twice. Use when a construction or renovation business tracks bid requests in a Google Sheet and wants contractor bid emails drafted for review, not sent automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a bid request row is updated, a draft bid email to the contractor is created for you to review, and the row is marked so it is not drafted twice."
  apps: "Google Sheets, Gmail"
  category: "Business Owners"
  job: "Construction operations"
  source: "https://zapier.com/automations/business-owners/construction-operations/project-bid-management/create-contractor-bid-emails-from-updated-sheet-rows"
---

# Create contractor bid emails from updated sheet rows

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-contractor-bid-emails-from-updated-sheet-rows. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an existing row in the tracker worksheet is updated (`google-sheets`, `updated_row_only`, Updated Spreadsheet Row). New rows do not trigger it.
2. **Filter:** the run stops if the row has no contractor email, or if its Drafted column already says `Yes`. The second check is what stops the row's own update from drafting it again.
3. **Gmail** creates a draft to the contractor's email. The subject is the project reference and location. The body has the project reference, location, details, description and a billing notice.
4. **Google Sheets** updates the same row: Drafted becomes `Yes` and Drafted At gets the time.

The Zap only creates drafts. It never sends an email; a coordinator reviews each draft in Gmail before sending.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `REPLACE_SPREADSHEET_ID` | The Google Sheet that holds the bid requests. Look up its ID from the user's Google Sheets connection. |

Also review the defaults with them, in `config.ts`:

- `WORKSHEET_ID` (`"0"` is the first tab) and the column keys (`COL$A` and so on) that map to the user's columns for the contractor email, project reference, location, project details, description, Drafted and Drafted At. Add the Drafted and Drafted At columns to the sheet if they are missing.
- `DRAFTED_VALUE` (`"Yes"`), the value the Drafted column holds once a draft exists.
- `BILLING_NOTICE` in `workflow.ts`: the text added to the end of every draft. Ask the user for their wording.

Also confirm: should the drafts come from the connected Gmail account? Gmail only sends from that account or its aliases, so a separate sender address needs an alias set up in Gmail first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the tracker) and `gmail` (the account that will hold the drafts) to the user's connections. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-row-only.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger's `spreadsheet` and `worksheet` are not in the trigger file, so set them to `SPREADSHEET_ID` and `WORKSHEET_ID`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. The contractor address is the connected Gmail account, so nothing leaves the account:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "you@example.com",
  "COL$B": "[install-test] BID-1001",
  "COL$C": "Brooklyn, NY 11215",
  "COL$D": "Kitchen gut renovation, about 2 weeks",
  "COL$E": "[install-test] Demolition, new cabinets and countertop install. Please send your bid.",
  "_content_hash": "2e8b284be27bd3338ed3e0308d916839"
}
```

Check that the run completed with no failed step, that Gmail's drafts folder has one new draft addressed to the contractor with the subject `<project reference> - <location>` and the details and billing notice in the body, and that it was not sent, and that row 2 has Drafted `Yes` and a time in Drafted At. If run-status tools aren't available, check the result in Gmail and the sheet directly. Then ask the user to delete the test draft and clear the test row, not the agent. Publish once the test passes, confirm the trigger is active, and tell the user where to find the drafts.

## Notes

- The trigger fires on any update to a row, so the Drafted check in the filter is what prevents repeat drafts. Do not remove it.
- If two rows have the same contractor, each gets its own draft.
- To send instead of draft, swap Gmail's Create Draft for Send Email. To add a CC, such as a coordinator's address, add it to the draft step.
- Never commit a real spreadsheet ID or contractor address.
