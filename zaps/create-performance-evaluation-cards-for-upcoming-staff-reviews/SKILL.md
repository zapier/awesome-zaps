---
name: create-performance-evaluation-cards-for-upcoming-staff-reviews
description: Build a Zap on Zapier that, each weekday morning, finds employees whose performance evaluation is due within three weeks and creates a Trello card with a checklist and form link for each one that doesn't already have a card. Use when an HR or people team keeps review dates in Zapier Tables or a similar table and wants supervisors to get a card ahead of each review without creating them by hand.
license: MIT
metadata:
  author: zapier
  summary: "Each weekday morning, supervisors get a Trello card with a checklist and evaluation form link for every employee whose review is coming up within three weeks."
  apps: "Schedule by Zapier, Zapier Tables, Trello"
  category: "Human Resources (HR)"
  job: "Performance management"
  source: "https://zapier.com/automations/human-resources-hr/performance-management/performance-review-cycles/create-performance-evaluation-cards-for-upcoming-staff-reviews"
---

# Create performance evaluation cards for upcoming staff reviews

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-performance-evaluation-cards-for-upcoming-staff-reviews. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** Schedule by Zapier runs every weekday at 6:45 AM (`schedule`, `everyWeek`).
2. **Zapier Tables** reads every row of the employees table and keeps those whose evaluation date falls within the next 21 days. If none do, the run stops and writes nothing.
3. **Trello** searches the review board for a card with the employee's full name. If none exists, the workflow creates one in the "Due Soon" list, due 7 days later, with a "To Complete" checklist holding that employee's evaluation form link (`?employee=<Employee ID>`). If the supervisor has a Trello member ID in the table, the supervisor is added to the card.
4. The run returns how many cards were created, how many already existed, and any failures. One failing employee does not stop the others.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                       | What goes there                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_EMPLOYEES_TABLE_ID`  | The Zapier Table that holds the employees. It needs Employee ID, First Name, Last Name, Evaluation Date, Supervisor ID and Trello Member ID columns, read by position as `f1` to `f6` |
| `REPLACE_TRELLO_BOARD_ID`     | The Trello board the review cards go on                                                                                                                                               |
| `REPLACE_TRELLO_LIST_ID`      | The list on that board that gets the cards, usually "Due Soon"                                                                                                                        |
| `REPLACE_EVALUATION_FORM_URL` | The evaluation form's base URL. Each card's checklist links to it with `?employee=<Employee ID>` added                                                                                |

All four live in `config.ts`.

Also review the defaults with them: `LOOKAHEAD_DAYS` (`21`), `CARD_DUE_DAYS` (`7`), `CHECKLIST_NAME` (`"To Complete"`), and whether the schedule should use a timezone other than the account's (the trigger uses the account's timezone unless an override is set).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` (the user's connection for the table that holds the employees) and `trello` (the account that owns the review board) to the user's connections. Schedule by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/every-week.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run the workflow once with empty input (`{}`), on a day when at least one employee in the table has an evaluation date within the next 21 days. Confirm:

- one card is created for each of those employees, titled with their full name and due 7 days from the run;
- each card has one checklist named "To Complete" that holds that employee's form link;
- employees with no evaluation date in the window get no card;
- running it again the same day creates no duplicate cards.

If run-status tools aren't available, check the cards in Trello directly. The user deletes any test cards if the table holds real data, not the agent.

## Notes

- The 21-day window is applied in the workflow after the table is read. Zapier Tables' Find Records action matches one field against one value, so it cannot return every row due in a range.
- Cards are matched to employees by full name, so two employees with the same name share one card.
- A run that finds nobody due stops early and writes nothing.
- Never commit a real table ID, board ID or form link to a public repo. Anyone with the board or form link can see the reviews.
- To extend it: notify the supervisor by email or a team channel when a card is created, or swap the checklist link for a short intake form or a PDF checklist.
