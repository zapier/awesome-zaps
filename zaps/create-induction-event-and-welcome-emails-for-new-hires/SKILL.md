---
name: create-induction-event-and-welcome-emails-for-new-hires
description: Build a Zap on Zapier that, when a new hire's start date is entered in a Zapier Tables onboarding table, emails the new hire a welcome, notifies IT and license owners, and creates an induction calendar event. Use when an HR or people team keeps new hires in a table and wants onboarding messages and the induction event sent automatically.
license: MIT
metadata:
  author: zapier
  summary: "When a new hire's start date is added to your onboarding table, they get a welcome email, IT gets a provisioning email, and an induction event goes on the HR calendar."
  apps: "Zapier Tables, Gmail, Google Calendar"
  category: "Human Resources (HR)"
  job: "Talent pipeline management"
  source: "https://zapier.com/automations/human-resources-hr/talent-pipeline-management/employee-onboarding/create-induction-event-and-welcome-emails-for-new-hires"
---

# Create induction event and welcome emails for new hires

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-induction-event-and-welcome-emails-for-new-hires. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a record in a Zapier Tables table is updated (`zapier-tables`, `updated_record`).
2. **Checks:** the record must have a start date and a valid contact email, and must not already have an Invited At value. Otherwise the run stops and writes nothing.
3. **`zapier-tables`** sets Invited At on the record, so later updates to the same record do not send the emails again.
4. **`gmail`** sends a welcome email to the new hire, CC'ing the HR coordinator. The body includes the start date (formatted as "November 12, 2026") and the induction link from the record.
5. **`gmail`** sends one internal email to the IT and license-owner addresses with the new hire's name, email, start date, hiring manager and induction link.
6. **`google-calendar`** creates an induction event on the HR calendar, one day before the start date, one hour long. The hiring manager and IT are invited.

The Zap changes only the record's Invited At value, so nothing else in the table is written.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | Where                                                                   | What goes there                                                         |
| ------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `REPLACE_TABLE_ID`             | `config.ts` (`TABLE_ID`) and `table_id` in `triggers/updated-record.ts` | The Zapier Tables table that holds the new-hire records                 |
| `REPLACE_HR_CALENDAR_ID`       | `config.ts` (`HR_CALENDAR_ID`)                                          | The HR calendar the induction event is created on                       |
| `REPLACE_HR_COORDINATOR_EMAIL` | `config.ts` (`HR_COORDINATOR_EMAIL`)                                    | The HR coordinator's address, CC'd on the welcome email                 |
| `REPLACE_IT_EMAIL`             | `config.ts` (`IT_EMAIL`)                                                | The IT address: gets the provisioning email and is invited to the event |
| `REPLACE_LICENSE_OWNERS_EMAIL` | `config.ts` (`LICENSE_OWNERS_EMAIL`)                                    | The license owners' address, which gets the provisioning email          |

Also review the defaults with them:

- `INDUCTION_OFFSET_DAYS` (`1`) and `INDUCTION_LENGTH_MINUTES` (`60`) in `workflow.ts`: when the event is scheduled and how long it lasts.
- The field keys in `config.ts` (`NAME` to `INVITED_AT`, `f1` to `f6`) must match the table's fields, in this order: `f1` Name (text), `f2` Email (email), `f3` Start Date (date/time), `f4` Induction Link (text), `f5` Hiring Manager Email (email), `f6` Invited At (text). If the table's order differs, change those constants to match.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the Zapier Tables connection for the account that owns the table, `gmail` to the Gmail connection that sends the emails, and `google-calendar` to the Google Calendar connection that owns the HR calendar. Every app here needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the table and the email addresses set to ones the user controls (not a real new hire's):

```json
{
  "record_id": "rec_test_0001",
  "table_id": "tbl_test_0001",
  "new": {
    "id": "rec_test_0001",
    "data": {
      "f1": "Test New Hire",
      "f2": "you@example.com",
      "f3": "2026-11-12T00:00:00Z",
      "f4": "https://example.com/induction",
      "f5": "you@example.com",
      "f6": null
    }
  }
}
```

Check that the welcome email reached the test address with the HR coordinator CC'd, the internal email reached the IT address, one induction event sits on the HR calendar the day before the start date with the new hire's name in its summary, and the record's Invited At is set. If run-status tools aren't available, check Gmail, Google Calendar and the table directly. Then clear Invited At on the test record so it can run again. Publish only after the test passes, then confirm the trigger is active. The user deletes the test emails, event and record; the agent doesn't.

## Notes

- The trigger fires on every update to a record. Invited At stops a second run from sending the emails, so changing the start date on an already-invited record does not send a new welcome email.
- Dates are formatted in UTC. In another time zone, the displayed date and the event time can differ by a day near midnight.
- The induction link is sent as plain text, and file attachments on the record are not included.
- To extend it: add a task for manual onboarding items to your project board, or choose an alternative welcome email for remote hires or contractors by a field on the record.
- Keep real calendar IDs, email addresses and table IDs out of commits.
