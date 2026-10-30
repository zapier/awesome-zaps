---
name: create-performance-evaluation-cards-for-upcoming-staff-reviews
description: Build a Zapier Next Gen Zap that, each weekday morning, finds employees whose performance evaluation is due within three weeks and creates a Trello card with a checklist and form link for each one that doesn't already have a card. Use when an HR or people team keeps review dates in Zapier Tables or a similar table and wants supervisors to get a card ahead of each review without creating them by hand.
metadata:
  author: zapier
  summary: "Each weekday morning, supervisors get a Trello card with a checklist and evaluation form link for every employee whose review is coming up within three weeks."
  apps: "Schedule by Zapier, Zapier Tables, Trello"
  category: "Human Resources (HR)"
  job: "Performance management"
  source: "https://zapier.com/automations/human-resources-hr/performance-management/performance-review-cycles/create-performance-evaluation-cards-for-upcoming-staff-reviews"
---

# Create performance evaluation cards for upcoming staff reviews

## What it does

1. **Trigger:** Schedule by Zapier runs every weekday at 6:45 AM.
2. **Zapier Tables** reads every row of the employees table and keeps those whose evaluation date falls within the next 21 days. If none do, the run stops and writes nothing.
3. **Trello** searches the review board for a card with the employee's full name. If none exists, the workflow creates one in the "Due Soon" list, due 7 days later, with a "To Complete" checklist holding that employee's evaluation form link (`?employee=<Employee ID>`). If the supervisor has a Trello member ID in the table, the supervisor is added to the card.
4. The run returns how many cards were created, how many already existed, and any failures. One failing employee does not stop the others.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Schedule by Zapier, Every Week (`schedule`, `everyWeek`), on Monday to Friday (`dow` `["0","1","2","3","4"]`, which this app labels Monday to Friday) at `6:45 AM`. It uses the account's timezone unless an override is set. It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the user's Zapier Tables connection, for the table that holds the employees.
   - `trello`: the user's Trello connection, for the account that owns the review board.
3. **Constants:**
   - `EMPLOYEES_TABLE_ID`: the long ID in the employees table's URL.
   - `TRELLO_BOARD_ID`: the Trello board the review cards go on.
   - `TRELLO_LIST_ID`: the ID of the "Due Soon" list on that board.
   - `EVALUATION_FORM_URL`: the base URL of the evaluation form. The employee's ID is appended as `?employee=<ID>`.
   - `LOOKAHEAD_DAYS`: how far ahead to look. Defaults to `21`.
   - `CARD_DUE_DAYS`: how many days after creation a card is due. Defaults to `7`.
   - `CHECKLIST_NAME`: the checklist name. Defaults to `"To Complete"`.
   - The record mapping reads six columns by position (`f1` to `f6`): Employee ID, First Name, Last Name, Evaluation Date, Supervisor ID, Trello Member ID. Set these to the table's own columns before deploying.

## Ask the user

- Which Zapier Tables table holds the employees, and which columns hold the employee ID, names, evaluation date, supervisor ID and the supervisor's Trello member ID?
- Which Trello board and list do the review cards go on? Is it the "Due Soon" list?
- What is the evaluation form's base URL? The workflow appends `?employee=<ID>` to it.
- Should the schedule use a timezone other than the account's?

## Test

Run the workflow once with empty input (`{}`), on a day when at least one employee in the table has an evaluation date within the next 21 days. Confirm:

- one card is created for each of those employees, titled with their full name and due 7 days from the run;
- each card has one checklist named "To Complete" that holds that employee's form link;
- employees with no evaluation date in the window get no card;
- running it again the same day creates no duplicate cards.

Then tell the user to delete any test cards if the table holds real data.

## Customize

- **Notify the supervisor by email or a team channel** when a card is created.
- **Swap the checklist link for a short intake form**, or attach a PDF checklist instead of the form link.

## Notes

- The 21-day window is applied in the workflow after the table is read. Zapier Tables' Find Records action matches one field against one value, so it cannot return every row due in a range.
- Cards are matched to employees by full name, so two employees with the same name share one card.
- A run that finds nobody due stops early and writes nothing.
- Never commit a real table ID, board ID or form link to a public repo. Anyone with the board or form link can see the reviews.
