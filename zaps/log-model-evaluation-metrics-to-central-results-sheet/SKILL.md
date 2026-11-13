---
name: log-model-evaluation-metrics-to-central-results-sheet
description: Build a Zap on Zapier that scores each prediction batch a model evaluation service posts to a webhook against a canonical targets file in Google Drive, and appends its total and high-error RMSE as one row to a shared Google Sheet for workshop review. Use when ML teams keep a central results sheet and want evaluations logged without manual copying.
license: MIT
metadata:
  author: zapier
  summary: "Each incoming prediction batch is scored against your targets file and its error metrics are added as a row in your central results sheet, ready for review."
  apps: "Webhooks by Zapier, Google Drive, Google Sheets"
  category: "Engineering"
  job: "Ml ops AI operations"
  source: "https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/log-model-evaluation-metrics-to-central-results-sheet"
---

# Log model evaluation metrics to central results sheet

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-model-evaluation-metrics-to-central-results-sheet. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a prediction batch arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The evaluation service posts JSON to it.
2. **Google Drive** finds the targets file by exact name (first match) and downloads its contents.
3. The workflow parses the targets, selects the entries for the batch's `workshop`, pairs each prediction with its target by `id`, and computes:
   - total RMSE across all paired predictions;
   - high-error RMSE across errors whose absolute value is at least 1.0 (0 if none).
     If no targets match the workshop, or no predictions pair with a target, the run stops and writes nothing.
4. **Google Sheets** appends one new row with the batch ID, submission time, workshop, team, both RMSE values and the profit estimate.

The Zap only appends rows; it never changes rows already in the sheet.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | What goes there                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `REPLACE_TARGETS_FILE_NAME` | The exact name of the targets JSON file in Google Drive, looked up with the user's Google Drive connection |
| `REPLACE_SPREADSHEET_ID`    | The central results sheet, looked up with the user's Google Sheets connection                              |

Review these defaults with the user:

- `WORKSHEET_ID` in `config.ts`: `"0"` is the first tab.
- `BATCH_ID_COLUMN` to `PROFIT_ESTIMATE_COLUMN` in `config.ts`: column keys such as `COL$A`, not header names. Map them to the sheet's columns: batch ID, submitted at, workshop, team, total RMSE, high-error RMSE, profit estimate.
- `HIGH_ERROR_THRESHOLD` in `workflow.ts`: the absolute error at which a prediction counts as high-error (1.0 by default).

Confirm two things before building:

- The targets file is JSON shaped `{ "<workshop>": [{ "id": ..., "actual": number }] }`. If it differs, the lookup code must change first.
- How the profit estimate is computed, if it should be more than a pass-through of the payload's `profit_estimate`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-drive` (the Drive account that holds the targets file; a work or test account works) and `google-sheets` (the account that owns the results sheet) to the user's connections. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. The trigger has no connection, so its `authentication_id` is `null`.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test (`run_workflow_draft` in Zapier MCP) with a sample batch whose `workshop` and prediction `id`s exist in the targets file:

```json
{
  "batch_id": "batch-001",
  "submitted_at": "2026-10-29T10:15:00Z",
  "workshop": "workshop-a",
  "team": "ml-platform",
  "predictions": [
    { "id": "r1", "predicted": 2.4 },
    { "id": "r2", "predicted": 5.1 }
  ],
  "profit_estimate": 1200
}
```

Check that exactly one row was appended with the right batch ID and workshop, and that the RMSE values match a hand calculation from the targets file. If run-status tools aren't available, check the result in Google Sheets directly. Then publish, confirm the trigger is active, and give the user the webhook URL to point the evaluation service at. Ask the user to delete the test row; the agent doesn't delete test data.

## Notes

- Skipped batches write nothing and notify no one. A failed Drive or Sheets call stops the run with an error.
- Google Sheets may show the timestamp in the sheet's own format and time zone.
- Keep the webhook URL private: anyone with it can write rows to the sheet.
- To customize: add a Slack or email step that alerts when the high-error RMSE exceeds a threshold, or write the paired predictions and targets to a second worksheet for post-mortem analysis.
