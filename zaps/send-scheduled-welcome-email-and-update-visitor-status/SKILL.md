---
name: send-scheduled-welcome-email-and-update-visitor-status
description: Build a Zap on Zapier for a Zapier Table that tracks website visitors or new customers through onboarding, so each one gets a welcome email automatically once they reach a milestone, then moves to the next stage. Sends from Gmail and writes the send time back to the record.
license: MIT
metadata:
  author: zapier
  summary: "When a visitor reaches the milestone you set in your table, they get a welcome email and their row moves to the next stage, with the send time recorded."
  apps: "Zapier Tables, Gmail"
  category: "Customer Service & Success"
  job: "Customer onboarding"
  source: "https://zapier.com/automations/customer-service-success/customer-onboarding/customer-welcome-sequences/send-scheduled-welcome-email-and-update-visitor-status"
---

# Send scheduled welcome email and update visitor status

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-scheduled-welcome-email-and-update-visitor-status. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a record in your Zapier Table is added or updated (`zapier-tables`, `updated_record`).
2. **Filter:** the run continues only if the milestone column equals `MILESTONE_VALUE`, and only if the record has no sent-at time and is not already at `NEXT_STAGE`. Otherwise it stops and changes nothing.
3. **Delay:** waits `SEND_DELAY_SECONDS` before sending. The default is 1 second, which sends right away.
4. **Gmail** sends the welcome email to the record's email column. The subject and body use the record's name.
5. **Zapier Tables** sets the stage column to `NEXT_STAGE` and writes the send time to the sent-at column. This runs only after the email is sent.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | Where                                                                    | What goes there                                                           |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `REPLACE_TABLE_ID` | `config.ts`, `TABLE_ID`; `triggers/updated-record.ts`, `params.table_id` | The Zapier Table that holds the visitors. Use the same ID in both places. |

Review these defaults with the user before the build:

- The column keys (`EMAIL_FIELD`, `NAME_FIELD`, `MILESTONE_FIELD`, `STAGE_FIELD`, `SENT_AT_FIELD` in `config.ts`) are `f1` to `f5`, in the order the columns were added. Confirm the table's columns sit in that order, or the email goes to the wrong address.
- `MILESTONE_VALUE` (`Signed up`) in `config.ts`: the value that starts the sequence.
- `NEXT_STAGE` (`Welcome sent`) in `config.ts`: the stage the record moves to after the email.
- `SEND_DELAY_SECONDS` (`1`) in `workflow.ts`: how long to wait before sending. Use a longer value such as `86400` for the next day.
- `EMAIL_SUBJECT` and `FROM_NAME` in `config.ts`, and `EMAIL_BODY` in `workflow.ts`: the email text. `{name}` is replaced with the record's name.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the Zapier Tables connection for the account that owns the table, and `gmail` to the Gmail connection that sends the welcome email. The trigger uses `zapier-tables` too.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/updated-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `params.table_id` to the same table. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Replace the email with an address you control, since the test sends a real email:

```json
{
  "record_id": "example-record-id",
  "table_id": "example-table-id",
  "new": {
    "id": "example-record-id",
    "data": {
      "f1": "you@example.com",
      "f2": "Test Visitor",
      "f3": "Signed up",
      "f4": "Welcome",
      "f5": null
    }
  }
}
```

Check that:

- The Gmail step returns a sent message, and the email arrives at the address in `f1` with the name in the subject.
- The `update-visitor-stage` step returns the record with `f4` set to `Welcome sent` and `f5` set to a timestamp.
- Run it again with the same record after it has been updated. The run should skip with `already-sent` and send nothing.

If run-status tools aren't available, check the result in Gmail and Zapier Tables directly. Ask the user to delete the test record and the test email. The agent does not delete data.

## Notes

- Zapier Tables fires the trigger on every update to a record. The workflow checks the sent-at time and stage first, so a record that has been emailed is not emailed again, even though its own update fires the trigger again.
- The duplicate check uses the values in the trigger payload, not a fresh lookup. Two quick updates to the same record could both pass it and send two emails.
- The delay is a fixed number of seconds. It does not wait for a business day or a time window.
- To skip the wait for priority records, add a priority column check to the filter. To personalize more or format the send time, add plain code before the send, not a separate step.
- Don't commit a real table ID or email address. Use placeholders.
