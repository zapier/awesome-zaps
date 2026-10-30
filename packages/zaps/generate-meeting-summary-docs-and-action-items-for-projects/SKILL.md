---
name: generate-meeting-summary-docs-and-action-items-for-projects
description: Use when a meeting tracker in Zapier Tables gets a new or updated row with a transcript, and you want a dated Google Doc per meeting with decisions, action items, key quotes, follow-ups and the companies mentioned. Good for project teams who log meetings in a table and want the follow-up doc made for them.
metadata:
  author: zapier
  summary: "When a meeting row with a transcript is added to your tracker, a dated Google Doc is created with the decisions, action items and companies from that meeting, ready to share."
  apps: "Zapier Tables, AI by Zapier, Google Docs"
  category: "Executives"
  job: "Meeting management"
  source: "https://zapier.com/automations/executives/meeting-management/action-item-tracking/generate-meeting-summary-docs-and-action-items-for-projects"
---

# Generate meeting summary docs and action items for projects

## What it does

1. **Trigger:** a Zapier Tables record is added or updated in your meeting tracker table.
2. If the row has no transcript, the run stops and creates nothing.
3. It waits two minutes so the row's own writes can settle.
4. **AI by Zapier** reads the transcript and returns decisions, action items (owner, task, due date), up to five key quotes, a one-line status, problems, and follow-ups.
5. **AI by Zapier** reads the Company Summary, Gist and Overview and sorts the companies into primary, secondary, mentioned and other.
6. **Google Docs** creates one doc named `<Title> - <date>` in your Drive folder. The body has the row's Gist, Overview, Notes and Action items, then the AI analysis and the company lists.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Zapier Tables, New or Updated Record (`zapier-tables` / `new_or_updated_record`). Set `table_id` to your tracker table. The trigger's connection is your Zapier Tables connection.
   - The code expects the table's columns in this order: `f1` Title, `f2` Date, `f3` Transcript, `f4` Gist, `f5` Overview, `f6` Notes, `f7` Action Items, `f8` Company Summary. If your columns differ, change the field keys in `RecordSchema` to match.
2. **Connections** (each alias in the code is the app's slug):
   - `google-docs`: the Google account that should own the new docs.
   - AI by Zapier (`ai`) needs no connection; it uses Zapier-managed credentials (`authentication_id: "0"`).
3. **Constants** (at the top of `workflow.ts`):
   - `DOC_FOLDER`: the Drive folder ID for the new docs. `"root"` puts them at the top level of My Drive.
   - `SETTLE_SECONDS`: wait before the AI steps. Default `120`.
   - `AI_MODEL`: the model for both AI steps. Default `"premium/auto"`.
4. Test with the steps below, then publish, confirm the trigger is `active`, and point the trigger at your real tracker table.

## Ask the user

- Which Zapier Table is the meeting tracker, and which columns hold the title, date, transcript, gist, overview, notes, action items and company summary?
- Which Drive folder should the docs go in? Give its ID, or leave `"root"`.
- Which Google account should own the docs?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. The run waits two minutes before the AI steps, so allow about three minutes. Use a throwaway table, not your real tracker.

```json
{
  "new": {
    "id": "01M654ZEAP3D7XAWGZEHCNV6QT",
    "data": {
      "f1": "[install-test] Q4 launch planning sync",
      "f2": "2026-10-29T13:00:00Z",
      "f3": "Dana: The launch moved to Friday after final testing. Decision: we ship the Zapier Tables connector in the Friday release. Sam: I will write the rollout checklist and send it to the eng list by Wednesday. Priya: the Acme Corp pilot is still blocked on SSO, and Globex asked about pricing for 200 seats. Dana: follow up with Acme on SSO next week.",
      "f4": "Launch moved to Friday; Acme pilot blocked on SSO.",
      "f5": "Final testing done. Acme Corp and Globex are the two customers in focus.",
      "f6": "",
      "f7": "Sam: rollout checklist by Wednesday. Dana: follow up with Acme on SSO.",
      "f8": "Acme Corp, Globex"
    }
  },
  "old": null,
  "record_id": "01M654ZEAP3D7XAWGZEHCNV6QT",
  "table_id": "YOUR_TABLE_ID"
}
```

Check that the new doc has the title `[install-test] Q4 launch planning sync - 2026-10-29` and that its body has every section filled: Gist, Overview, Notes (`(none)`), the tracker's action items, the AI decisions, action items, key quotes, status, problems and follow-ups, and the company lists. The sample transcript should yield Sam's and Dana's action items, the SSO blocker, and Acme Corp and Globex as primary companies.

## Customize

- **Only meetings with transcripts attached or qualifying tags:** the transcript check is in place; a tag filter is not.
- **Post the doc link to your project channel, or email the assigned owners:** add a Slack or Gmail step after the doc step.

## Notes

- The AI outputs go into the doc only. They are not written back to the tracker's Meeting Analysis or company fields.
- The doc title uses the date part of the row's date value, which is UTC.
- Never commit a real table ID, folder ID or Google account ID.
