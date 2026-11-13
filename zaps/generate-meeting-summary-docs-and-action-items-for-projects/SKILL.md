---
name: generate-meeting-summary-docs-and-action-items-for-projects
description: Build a Zap on Zapier that, when a meeting row with a transcript is added or updated in a Zapier Tables meeting tracker, creates a dated Google Doc with the decisions, action items, key quotes, follow-ups and companies from that meeting. Use when a project team logs meetings in a table and wants the follow-up doc made for them.
license: MIT
metadata:
  author: zapier
  summary: "When a meeting row with a transcript is added to your tracker, a dated Google Doc is created with the decisions, action items and companies from that meeting, ready to share."
  apps: "Zapier Tables, AI by Zapier, Google Docs"
  category: "Executives"
  job: "Meeting management"
  source: "https://zapier.com/automations/executives/meeting-management/action-item-tracking/generate-meeting-summary-docs-and-action-items-for-projects"
---

# Generate meeting summary docs and action items for projects

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/generate-meeting-summary-docs-and-action-items-for-projects. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row is added or updated in your meeting tracker table (`zapier-tables`, `new_or_updated_record`).
2. If the row has no transcript, the run stops and creates nothing.
3. It waits two minutes so the row's own writes can settle.
4. **AI by Zapier** reads the transcript and returns decisions, action items (owner, task, due date), up to five key quotes, a one-line status, problems, and follow-ups.
5. **AI by Zapier** reads the company summary, gist and overview and sorts the companies into primary, secondary, mentioned and other.
6. **Google Docs** creates one doc named `<Title> - <date>` in your Drive folder. The body has the row's gist, overview, notes and action items, then the AI analysis and the company lists.

The AI output goes into the doc only. The tracker row is not changed.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | Where                                           | What goes there                              |
| ------------------ | ----------------------------------------------- | -------------------------------------------- |
| `REPLACE_TABLE_ID` | `triggers/new-or-updated-record.ts`, `table_id` | The Zapier Table that is the meeting tracker |

Also confirm the tracker's columns are, in order: `f1` title, `f2` date, `f3` transcript, `f4` gist, `f5` overview, `f6` notes, `f7` action items, `f8` company summary. If they differ, change the field keys in `RecordSchema` to match.

Review these defaults with them: `DOC_FOLDER` (the Drive folder ID for the new docs; `"root"` puts them at the top level of My Drive) and `AI_MODEL` (`"premium/auto"`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `zapier-tables` to the user's Zapier Tables connection for the tracker, and `google-docs` to the Google account that should own the new docs. AI by Zapier (`ai`) uses Zapier-managed credentials and needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-or-updated-record.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a throwaway tracker table, not the real one:

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
  "table_id": "01M654ZEAP3D7XAWGZEHCNV6QA"
}
```

The run waits two minutes before the AI steps, so allow about three minutes. Check that the new doc has the title `[install-test] Q4 launch planning sync - 2026-10-29` and that its body has every section filled: gist, overview, notes (`(none)`), the tracker's action items, the AI decisions, action items, key quotes, status, problems and follow-ups, and the company lists. The sample transcript should yield Sam's and Dana's action items, the SSO blocker, and Acme Corp and Globex as primary companies. If run-status tools aren't available, check the result in Google Docs directly. Ask the user to delete the test row and the test doc. Then publish, confirm the trigger is active, and point it at the real tracker table.

## Notes

- The AI output is input for the reader of the doc. It is not written back to the tracker's analysis or company fields.
- The doc title uses the date part of the row's date value, which is UTC.
- To post the doc link to a project channel or email the owners, add a Slack or Gmail step after the doc step.
