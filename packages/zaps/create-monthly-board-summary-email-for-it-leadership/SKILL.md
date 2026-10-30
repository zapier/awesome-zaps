---
name: create-monthly-board-summary-email-for-it-leadership
description: Build a Zapier Next Gen Zap that emails IT leadership a monthly summary of the open cards on a Trello board, ahead of the governance meeting. Use when a team tracks work in a Trello board and wants leadership to get a recurring list of open items with status, last activity and links, without anyone compiling it by hand.
metadata:
  author: zapier
  summary: "Once a month, the open cards on your Trello board are listed in one email to leadership, with each card's status, last activity and link."
  apps: "Schedule by Zapier, Trello, Gmail"
  category: "Executives"
  job: "Reporting management"
  source: "https://zapier.com/automations/executives/reporting-management/cross-functional-report-aggregation/create-monthly-board-summary-email-for-it-leadership"
---

# Create monthly board summary email for IT leadership

## What it does

1. **Trigger:** on the first day of each month at 9:00 AM, a Schedule by Zapier trigger starts the run.
2. **Trello** searches the configured board for open cards, up to 200. For each card it reads the title, the list it sits in (its status), the last-activity date and the card link.
3. The workflow turns those cards into one plain-text list, one line per card, with a count at the top. An empty board still gets an email saying there are no open cards.
4. **Gmail** sends that list to the configured leadership address, with a subject line that gives the card count and a sender name for clarity.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Month (`schedule` / `everyMonth`). Params: `dom: ["1"]`, `hod: "9:00 AM"`. No connection, so `authentication_id` is `null`. No timezone override is set, so the account's timezone applies.
2. **Connections** (each alias in the code is the app's slug):
   - `trello`: the Trello connection for the account that can read the board. The builder's account had none.
   - `gmail`: the Gmail connection whose address the summary is sent from.
3. **Constants:**
   - `TRELLO_BOARD_ID`: the board's ID, from its URL or the board dropdown.
   - `MAX_CARDS`: the most cards to include. Defaults to `200`.
   - `RECIPIENT_EMAIL`: the leadership alias or board owner who receives the summary.
   - `FROM_NAME`: the sender name on the email.
   - `SUBJECT_PREFIX`: text before the subject. Leave it empty.

## Ask the user

- Which Trello board is the source, and is it open-cards only, or should archived cards be excluded too? The workflow sends open cards only.
- Who gets the summary: a leadership alias, or the board owner?
- Should the send time or timezone change from 9:00 AM on the 1st in the account timezone?

## Test

Once a Trello connection exists, run the draft as a test (`run_workflow_draft`) with no input, since the trigger supplies none. Use a board you own and a `RECIPIENT_EMAIL` you control.

Check that:

- The email arrives at the recipient with a subject of the form `Monthly board summary: N open cards`.
- The body lists one line per open card, each with its title, list name, last-activity date and link.
- A board with no open cards still sends the email, saying `No open cards.`

## Customize

- **Post to a team channel** instead of email: replace the Gmail step with a Slack message to the channel.
- **Attach the summary** as a CSV or PDF for archive or distribution: add a step that builds the file from the same card list and attaches it to the email.

## Notes

- The original spec used Zapier's own "Email by Zapier" step. It sends from Zapier's domain. This version sends through Gmail from a connected account, so the email comes from that address.
- Card status is the Trello list name. Trello has no separate status field.
- The date on each line is the card's last-activity date, cut to the day. It is not the creation date.
- Never commit a real board ID, recipient address or webhook URL.
