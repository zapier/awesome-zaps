---
name: send-scheduled-welcome-email-and-update-visitor-status
description: Use when a Zapier Table tracks website visitors or new customers through onboarding and each one should get a welcome email automatically once they reach a milestone, then move to the next stage. Sends from Gmail and writes the send time back to the record.
metadata:
  author: zapier
  summary: "When a visitor reaches the milestone you set in your table, they get a welcome email and their row moves to the next stage, with the send time recorded."
  apps: "Zapier Tables, Gmail"
  category: "Customer Service & Success"
  job: "Customer onboarding"
  source: "https://zapier.com/automations/customer-service-success/customer-onboarding/customer-welcome-sequences/send-scheduled-welcome-email-and-update-visitor-status"
---

# Send scheduled welcome email and update visitor status

## What it does

1. **Trigger:** a record in your Zapier Table is added or updated (Zapier Tables, Updated Record).
2. **Filter:** it continues only if the milestone column equals `MILESTONE_VALUE`, and only if the record has no sent-at time and is not already at `NEXT_STAGE`. Otherwise the run stops and changes nothing.
3. **Delay:** waits `SEND_DELAY_SECONDS` before sending. The default is 1 second, which sends right away.
4. **Gmail:** sends the welcome email to the record's email column. The subject and body use the record's name.
5. **Zapier Tables:** sets the stage column to `NEXT_STAGE` and writes the send time to the sent-at column. This runs only after the email is sent.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** `zapier-tables` / `updated_record` (Zapier Tables, Updated Record). Set `params.table_id` to your table.
2. **Connections** (each alias in the code is the app's slug):
   - `zapier-tables`: the Zapier Tables connection for the account that owns the table.
   - `gmail`: the Gmail connection that sends the welcome email.
3. **Constants:**
   - `TABLE_ID`: the Table ID from the table's URL.
   - `EMAIL_FIELD`, `NAME_FIELD`, `MILESTONE_FIELD`, `STAGE_FIELD`, `SENT_AT_FIELD`: the table's column keys, `f1` for the first column, `f2` for the second, and so on. Set them to match the order your columns were added in. The trigger payload uses these keys, so a wrong order sends to the wrong address.
   - `MILESTONE_VALUE`: the value that starts the sequence.
   - `NEXT_STAGE`: the stage to move the record to after the email.
   - `SEND_DELAY_SECONDS`: wait before sending. Minimum 1.
   - `EMAIL_SUBJECT`, `EMAIL_BODY`, `FROM_NAME`: the email text. `{name}` is replaced with the record's name.

## Ask the user

- Which table holds the visitors, and which columns hold the email address, name, milestone, stage and sent-at time? Do the columns sit in that order?
- What milestone value should start the sequence, and what stage should the record move to after the email?
- How long should the send wait? Use `1` to send right away, or a longer value such as `86400` for the next day.
- What should the subject, body and sender name say?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use an email address you control, since the test sends a real email. The sample matches the trigger's payload shape:

```json
{
  "record_id": "YOUR_RECORD_ID",
  "table_id": "YOUR_TABLE_ID",
  "new": {
    "id": "YOUR_RECORD_ID",
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

Then tell the user to set the record back to its earlier values if it was real data.

## Customize

- **Immediate send for priority records:** set `SEND_DELAY_SECONDS` to `1` for all records, or add a priority column check in the filter and skip the wait for those records.
- **Localized times or more personal content:** add a step that formats the sent-at time or the email body before the send. Use plain code, not a separate step.

## Notes

- Zapier Tables fires the trigger on every update to the record. This is why the workflow checks the sent-at time and stage before it sends. A record that has already been emailed will not be emailed again, even though the update it caused fires the trigger again.
- The duplicate check uses the values in the trigger payload, not a fresh lookup. Two updates to the same record in quick succession could both pass the check and send two emails.
- The delay is a fixed number of seconds. It does not wait for a business day or a weekday and time window.
- Only the name is used to personalize the email. The subject and body are plain text inside `EMAIL_SUBJECT` and `EMAIL_BODY`.
- Never commit a real table ID or email address. The copy here uses `YOUR_TABLE_ID`.
