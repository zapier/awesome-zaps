---
name: create-m-a-deal-records-from-newsletter-emails-for-review
description: Build a Zap on Zapier that reads each incoming M&A newsletter email, creates one deal record per deal mentioned in a Zapier Table, and posts a summary to a team Slack channel for review. Use when a corporate development, strategy or research team receives deal newsletters and wants the M&A mentions logged without retyping them.
license: MIT
metadata:
  author: zapier
  summary: "When a deal newsletter arrives, each M&A deal it mentions becomes a row in your deal table, and the team gets a short Slack summary to review."
  apps: "Microsoft Outlook, AI by Zapier, Zapier Tables, Slack"
  category: "Executives"
  job: "Corporate development"
  source: "https://zapier.com/automations/executives/corporate-development/due-diligence-management/create-m-a-deal-records-from-newsletter-emails-for-review"
---

# Create M&A deal records from newsletter emails

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-m-a-deal-records-from-newsletter-emails-for-review. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new email arrives in your newsletter folder (`microsoft-outlook`, `new_email_personal`).
2. **AI by Zapier** reads the email and returns a list of M&A deals, each with seller, buyer, description, date, advisor and deal number. It leaves advisor blank when none is named.
3. **Zapier Tables** gets one new record per deal, with the six fields filled in.
4. **Slack** posts one summary message to your team channel listing the deals added.

If the email mentions no deals, the run stops without writing anything.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting         | Where       | What goes there                                                                                                                               |
| --------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `TABLE_ID`      | `config.ts` | The Zapier table that receives one record per deal. It needs six text columns: Seller, Buyer, Deal Description, Date, Advisor, Deal Reference |
| `SLACK_CHANNEL` | `config.ts` | The channel that gets the team summary                                                                                                        |

Also ask:

- Which mailbox folder receives the newsletters? Set it as the trigger's folder.
- Does the Zapier table already have the six columns? If not, create them.
- Should a run skip deals already in the table? This Zap does not check for duplicates yet (see Notes).

Review these defaults with them:

- `MESSAGE_PREFIX` in `config.ts`: `"[install-test] "` marks test messages. Set it to `""` for real use.
- `MENTION_CHANNEL` in `workflow.ts`: `false` keeps the summary silent. Set it to `true` to @channel-mention the team.
- `MAX_DEALS` in `workflow.ts`: the most deals taken from one email. Defaults to 10.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-outlook` (the mailbox that receives the newsletters), `zapier-tables` (the account that owns the deal table) and `slack` (the workspace with the team channel) to the user's connections. AI by Zapier needs none: it uses Zapier-managed model credentials.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-email-personal.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's folder to the newsletter folder. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (Zapier Tables, Slack and AI by Zapier) and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. It uses invented deal names, so no real company appears in the table or channel:

```json
{
  "subject": "Deals newsletter",
  "body": "Harbor Logistics agreed to acquire Pine Freight from its owners. Advisor: Northgate Partners. Deal no. TD-101. Announced 2026-10-20.\n\nLumen Health sold its diagnostics unit to Cobalt Labs. No advisor was named. Deal no. TD-102. Announced 2026-10-21."
}
```

Confirm that the run completed with `created: 2, failures: 0`, that two new rows appear in the deal table with the seller, buyer, description, date, advisor and deal number in the right columns (the second row's advisor is blank), and that one summary message appears in the channel listing both deals. If run-status tools aren't available, check the deal table and the channel directly. Ask the user to delete the test rows and message; the agent does not delete them.

## Notes

- Dates are kept as the AI reads them from the email (for example "2026-10-20" or "Oct 20"). They are not converted to a date column.
- Each run creates a record for every deal in the email, so a repeated email adds duplicates. Matching on buyer, seller and date before creating a row is not built yet.
- The summary is one message per email, not one per deal.
- Emails are newsletters, so the AI may misread a deal. Check the rows against the email until you trust the output.
- Check that your plan includes AI by Zapier before you publish.
- To notify only for priority deals, post to Slack only above a set size or for a keyword. To keep the source, add the original email text or a link to each record.
