---
name: create-monthly-board-summary-email-for-it-leadership
description: Build a Zap on Zapier that emails IT leadership a monthly summary of the open cards on a Trello board, ahead of the governance meeting. Use when a team tracks work in a Trello board and wants leadership to get a recurring list of open items with status, last activity and links, without anyone compiling it by hand.
license: MIT
metadata:
  author: zapier
  summary: "Once a month, the open cards on your Trello board are listed in one email to leadership, with each card's status, last activity and link."
  apps: "Schedule by Zapier, Trello, Gmail"
  category: "Executives"
  job: "Reporting management"
  source: "https://zapier.com/automations/executives/reporting-management/cross-functional-report-aggregation/create-monthly-board-summary-email-for-it-leadership"
---

# Create monthly board summary email for IT leadership

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-monthly-board-summary-email-for-it-leadership. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** on the first day of each month at 9:00 AM, Schedule by Zapier (`schedule`, `everyMonth`) starts the run.
2. **Trello** searches the configured board for open cards, up to 200. For each card it reads the title, the list it sits in (its status), the last-activity date and the card link.
3. The workflow turns those cards into one plain-text list, one line per card, with a count at the top. An empty board still gets an email saying there are no open cards.
4. **Gmail** sends that list to the configured leadership address, with a subject line that gives the card count and a sender name for clarity.

The Zap only reads the board and sends one email; it never changes a card.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting           | What goes there                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `TRELLO_BOARD_ID` | The Trello board to summarize. Look it up with the user's Trello connection; its ID is in the board's URL |
| `RECIPIENT_EMAIL` | The address the summary is emailed to: a leadership alias or the board owner                              |

Also review the defaults with them: the send time (9:00 AM on the 1st, in the account's timezone, set in `triggers/every-month.ts`) and `FROM_NAME`, the sender name on the email. The workflow sends open cards only, so there is nothing to choose about archived cards.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `trello` to the user's Trello connection for the account that can read the board, and `gmail` to the Gmail connection whose address the summary is sent from. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-month.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft`) with no input, since the trigger supplies none. Use a board you own and a `RECIPIENT_EMAIL` you control.

Check that:

- The email arrives at the recipient with a subject of the form `Monthly board summary: N open cards`.
- The body lists one line per open card, each with its title, list name, last-activity date and link.
- A board with no open cards still sends the email, saying `No open cards.`

If run-status tools aren't available, check the result in Gmail directly. Ask the user to delete the test email; the agent doesn't delete test data.

## Notes

- The email comes from the connected Gmail address, not Zapier's domain. The original spec used Zapier's own "Email by Zapier" step.
- Card status is the Trello list name. Trello has no separate status field.
- The date on each line is the card's last-activity date, cut to the day. It is not the creation date.
- To post to a team channel instead of email, replace the Gmail step with a Slack message. To attach the summary as a CSV or PDF, add a step that builds the file from the same card list.
- Never commit a real board ID, recipient address or webhook URL.
