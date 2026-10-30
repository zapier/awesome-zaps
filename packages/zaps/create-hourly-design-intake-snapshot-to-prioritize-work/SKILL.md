---
name: create-hourly-design-intake-snapshot-to-prioritize-work
description: Build a Zapier Next Gen Zap that emails a design lead an hourly digest of active design requests from a Google Sheets intake tracker, listing the top 15 by priority and flagging unassigned items. Use when a design team logs requests in a sheet or form and wants an hourly view of what is open, what is high priority and what has no owner.
metadata:
  author: zapier
  summary: "Every hour, the design requests still open in your intake sheet are sorted by priority, unassigned ones are flagged, and the list is emailed to the person who decides what to work on next."
  apps: "Schedule by Zapier, Google Sheets, Gmail"
  category: "Design"
  job: "Design project management"
  source: "https://zapier.com/automations/design/design-project-management/design-request-intake/create-hourly-design-intake-snapshot-to-prioritize-work"
---

# Create hourly design intake snapshot to prioritize work

## What it does

1. **Trigger:** Schedule by Zapier, every hour, at the top of the hour, including weekends.
2. **Google Sheets** reads up to 200 rows from the intake tab (columns A to F: title, client reference, status, priority, owner, submitted time).
3. Plain code, no app step: rows with a status of `Done` or `Archived`, and rows with no title, are dropped. Rows with the same title and client reference are counted once. The rest are sorted High, then Medium, then Low.
4. If no active requests remain, the run stops and sends nothing.
5. **Gmail** sends one email to the address in the constant below. It has the count of active requests, how many are high priority and how many are unassigned, the top 15 by priority with unassigned ones marked `[FLAG: unassigned]`, an action list naming each unassigned request, and a link to the intake sheet.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, `schedule` / `everyHour`, `authentication_id: null`. Params: `weekends: "yes"`. The time offset is left at its default, the top of the hour.
2. **Connections** (each alias in the code is the app's slug):
   - `google-sheets`: the Google account that owns the intake spreadsheet.
   - `gmail`: the Gmail account that sends the digest. It is also the only allowed recipient in the test, see Notes.
3. **Constants** (at the top of `workflow.ts`):
   - `INTAKE_SPREADSHEET_ID`: the long ID in the intake sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `DIGEST_RECIPIENT`: the email address that receives the digest.
   - `MAX_ITEMS`: how many items the digest lists. Defaults to 15.
   - `MAX_ROWS`: how many sheet rows to read. Defaults to 200; the action allows up to 1,500.
   - `PRIORITY_ORDER`: the priority values in the sheet, highest first. Defaults to High, Medium, Low.
   - `FINISHED_STATUSES`: status values to leave out. Defaults to Done and Archived.
4. The sheet's first row must be headers, and the columns must be in the order above. Change the `range` input in the code if the columns differ.
5. Test with the steps below, then publish, wait until the trigger is active, and tell the user it runs every hour.

## Ask the user

- Which spreadsheet and tab hold the design requests, and which columns are the title, client reference, status, priority, owner and submitted time? If the team uses a form or a project board instead, this workflow needs a different first step.
- Which status values mean a request is finished? The defaults are `Done` and `Archived`.
- Which email address should receive the digest?
- Should the digest run only on weekdays or during business hours? It runs every hour, including weekends, by default.

## Test

Run this as a draft test run (`run_workflow_draft`) before publishing. The input is an empty object, because the schedule trigger sends nothing the code reads. The test sheet held four rows:

| Title                                   | Client reference | Status | Priority | Owner  | Submitted        |
| --------------------------------------- | ---------------- | ------ | -------- | ------ | ---------------- |
| [install-test] Homepage refresh         | CLIENT-001       | New    | High     | (none) | 2026-10-29 08:00 |
| [install-test] Pricing page redesign    | CLIENT-002       | Active | Medium   | Dana   | 2026-10-28 15:00 |
| [install-test] Onboarding illustrations | CLIENT-003       | Done   | Low      | Sam    | 2026-10-20 09:00 |
| [install-test] Email template           | CLIENT-004       | Active | High     | (none) | 2026-10-27 11:00 |

Confirm that:

- The subject reads `Design intake: 3 active, 2 unassigned`. The `Done` row is left out.
- The list is in this order: Homepage refresh, Email template, Pricing page redesign. The two High items come first, then the Medium one.
- Homepage refresh and Email template are marked `[FLAG: unassigned]` and appear in the action list. Pricing page redesign shows `owner: Dana`.
- The email arrives in the recipient's inbox with the intake sheet link at the bottom.

Then publish, check that the trigger reads back as `active`, and point the user at the workflow's editor link.

## Customize

- **Route the digest to a Slack channel** instead of email for faster team visibility.
- **Run only on weekdays** or during the team's business hours.

## Notes

- The spec described the intake source as "project board, form, or spreadsheet". This zap reads a spreadsheet only, because that is the one source with a direct read action here.
- "Active" means any status other than the finished ones. The workflow has no time window, so a request stays in the digest until someone changes its status.
- Only the sheet link is included, not a link per request. The sheet has no per-row URL.
- Email is sent to one address. Unlike the spec's "decision makers", there is no list. Change `DIGEST_RECIPIENT` for a different recipient.
- Never commit a real spreadsheet ID or email address. Anyone who can read the sheet can see the request titles in the digest.
