---
name: create-m-a-deal-records-from-newsletter-emails-for-review
description: Build a Zapier Next Gen Zap that reads each incoming M&A newsletter email, creates one deal record per deal mentioned in a Zapier Table, and posts a summary to a team Slack channel for review. Use when a corporate development, strategy or research team receives deal newsletters and wants the M&A mentions logged without retyping them.
metadata:
  author: zapier
  summary: "When a deal newsletter arrives, each M&A deal it mentions becomes a row in your deal table, and the team gets a short Slack summary to review."
  apps: "Microsoft Outlook, AI by Zapier, Zapier Tables, Slack"
  category: "Executives"
  job: "Corporate development"
  source: "https://zapier.com/automations/executives/corporate-development/due-diligence-management/create-m-a-deal-records-from-newsletter-emails-for-review"
---

# Create M&A deal records from newsletter emails

## What it does

1. **Trigger:** a new email arrives in your newsletter folder (Microsoft Outlook).
2. **AI by Zapier** reads the email and returns a list of M&A deals, each with seller, buyer, description, date, advisor and deal number. It leaves advisor blank when none is named.
3. **Zapier Tables** gets one new record per deal, with the six fields filled in.
4. **Slack** posts one summary message to your team channel listing the deals added.

If the email mentions no deals, the run stops without writing anything.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants at the top; everything else stays as written.

1. **Trigger:** Microsoft Outlook, New Email in Personal Inbox (`microsoft-outlook`, `new_email_personal`). Set its folder to the newsletter folder. Map the trigger's body field to the code's `body` input, and its subject field to `subject`. Neither mapping was checked: the Outlook connection was missing.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection that owns the deal table.
   - `slack`: the Slack connection for the workspace that owns the team channel.
   - `ai`: none. It uses Zapier-managed model credentials (`authentication_id: "0"`).
3. **Table:** create one Zapier table with six columns, all text: `Seller`, `Buyer`, `Deal Description`, `Date`, `Advisor`, `Deal Reference`. Put its ID in `TABLE_ID`.
4. **Constants:**
   - `TABLE_ID`: the deal table's ID.
   - `SLACK_CHANNEL`: the channel's ID, starting with C.
   - `MENTION_CHANNEL`: `false` keeps the summary silent. Set `true` to @channel-mention the team.
   - `MESSAGE_PREFIX`: the test marker. Set it to `""` before real use.
   - `MAX_DEALS`: the most deals taken from one email. Defaults to 10.
5. Test with the steps below, then publish, wait until the trigger is active, and tell the user which folder to watch.

## Ask the user

- Which mailbox folder receives the newsletters? The code only handles the trigger's folder setting, so it needs that folder name.
- Which Zapier table holds the deal records, and does it already have the six columns?
- Which Slack channel gets the summary, and should the team be @channel-mentioned?
- Should a run skip deals already in the table? This zap does not check for duplicates (see Notes).

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use invented deal names so no real company appears in the table or channel:

```json
{
  "subject": "Deals newsletter",
  "body": "Harbor Logistics agreed to acquire Pine Freight from its owners. Advisor: Northgate Partners. Deal no. TD-101. Announced 2026-10-20.\n\nLumen Health sold its diagnostics unit to Cobalt Labs. No advisor was named. Deal no. TD-102. Announced 2026-10-21."
}
```

Confirm that the run completed with `created: 2, failures: 0`, that two new rows appear in the deal table with the seller, buyer, description, date, advisor and deal number in the right columns (the second row's advisor is blank), and that one summary message appears in the channel listing both deals. Then delete the test rows and message.

## Customize

- **Notify only for priority deals:** post to Slack only for deals above a set size or with a keyword, such as a named buyer or sector.
- **Keep the source excerpt:** add the original email text or a link to the saved record, so each row can be checked against the newsletter.

## Notes

- Dates are kept as the AI reads them from the email (for example "2026-10-20" or "Oct 20"). They are not converted to a date column.
- This zap creates a record for every deal in each email. A run that is repeated on the same email will add duplicates. Matching on buyer, seller and date before creating a row is not built yet.
- The summary is one message per email, not one per deal.
- The AI step runs on Zapier-managed model credentials. Check that your plan includes AI by Zapier before you publish.
- Emails are newsletters, so they may contain deals the AI misreads. Check the rows against the email until you trust the output.
