---
name: create-hourly-design-intake-snapshot-to-prioritize-work
description: Build a Zap on Zapier that emails a design lead an hourly digest of active design requests from a Google Sheets intake tracker, listing the top 15 by priority and flagging unassigned items. Use when a design team logs requests in a sheet or form and wants an hourly view of what is open, what is high priority and what has no owner.
license: MIT
metadata:
  author: zapier
  summary: "Every hour, the design requests still open in your intake sheet are sorted by priority, unassigned ones are flagged, and the list is emailed to the person who decides what to work on next."
  apps: "Schedule by Zapier, Google Sheets, Gmail"
  category: "Design"
  job: "Design project management"
  source: "https://zapier.com/automations/design/design-project-management/design-request-intake/create-hourly-design-intake-snapshot-to-prioritize-work"
---

# Create hourly design intake snapshot to prioritize work

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-hourly-design-intake-snapshot-to-prioritize-work. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** `schedule`, every hour at the top of the hour, including weekends.
2. **Google Sheets** (`google-sheets`) reads up to 200 rows from the intake tab: columns A to F are title, client reference, status, priority, owner and submitted time.
3. The workflow drops rows with a status of `Done` or `Archived` and rows with no title, counts rows with the same title and client reference once, and sorts the rest High, then Medium, then Low. If no active requests remain, it stops and sends nothing.
4. **Gmail** (`gmail`) sends one email to `DIGEST_RECIPIENT`. It has the count of active requests, how many are high priority and how many are unassigned, the top 15 by priority with unassigned ones marked `[FLAG: unassigned]`, an action list, and a link to the intake sheet.

The digest only reads the sheet and only goes to `DIGEST_RECIPIENT`. Nothing is written back to the sheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                         | What goes there                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `REPLACE_INTAKE_SPREADSHEET_ID` | The intake spreadsheet that holds the design requests. Look it up with the user's Google Sheets connection. |
| `REPLACE_DIGEST_RECIPIENT`      | The email address that gets the digest. It must be the connected Gmail account itself.                      |

Also review the defaults with them: `WORKSHEET_ID` in `config.ts` (`"0"` is the first tab), `MAX_ITEMS` (15), `MAX_ROWS` (200), `PRIORITY_ORDER` (High, Medium, Low) and `FINISHED_STATUSES` (Done, Archived) in `workflow.ts`, and the weekend setting in `triggers/every-hour.ts` (`weekends: "yes"`, so the digest runs every hour, weekends included).

Before turning it on, confirm the intake tab's first row is headers and its columns are in the order above. If the team logs requests in a form or a project board instead, this zap needs a different first step. If the columns differ, change the `range` in `workflow.ts`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` to the Google account that owns the intake spreadsheet, and `gmail` to the Gmail account that sends the digest. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-hour.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test before publishing, with a test tab that holds these four rows. The input is an empty object: the schedule trigger sends nothing the code reads.

| Title                                   | Client reference | Status | Priority | Owner  | Submitted        |
| --------------------------------------- | ---------------- | ------ | -------- | ------ | ---------------- |
| [install-test] Homepage refresh         | CLIENT-001       | New    | High     | (none) | 2026-10-29 08:00 |
| [install-test] Pricing page redesign    | CLIENT-002       | Active | Medium   | Dana   | 2026-10-28 15:00 |
| [install-test] Onboarding illustrations | CLIENT-003       | Done   | Low      | Sam    | 2026-10-20 09:00 |
| [install-test] Email template           | CLIENT-004       | Active | High     | (none) | 2026-10-27 11:00 |

Check that:

- The subject reads `Design intake: 3 active, 2 unassigned`. The `Done` row is left out.
- The list is in this order: Homepage refresh, Email template, Pricing page redesign.
- Homepage refresh and Email template are marked `[FLAG: unassigned]` and appear in the action list. Pricing page redesign shows `owner: Dana`.
- The email arrives in the recipient's inbox with the intake sheet link at the bottom.

If run-status tools aren't available, check the email in Gmail directly. Then publish and confirm the trigger is active. Ask the user to delete the test rows and the test email; the agent doesn't delete them.

## Notes

- "Active" means any status other than the finished ones. There is no time window, so a request stays in the digest until its status changes.
- The digest links to the whole intake sheet, not to each request, because the sheet has no per-row URL.
- To send the digest to a Slack channel for faster team visibility, replace the Gmail step. To run only on weekdays or during business hours, change the schedule.
- The digest goes to one address. Change `DIGEST_RECIPIENT` for a different recipient.
- Never commit a real spreadsheet ID or email address. Anyone who can read the sheet can see the request titles in the digest.
