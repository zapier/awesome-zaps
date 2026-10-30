---
name: log-model-evaluation-metrics-to-central-results-sheet
description: Use when a model evaluation service posts prediction batches to a webhook and you want each batch scored against a canonical targets file in Google Drive, with total and high-error RMSE appended as one row to a shared Google Sheet for workshop review. Good for ML teams that keep a central results sheet and want evaluations logged without manual copying.
metadata:
  author: zapier
  summary: "Each incoming prediction batch is scored against your targets file and its error metrics are added as a row in your central results sheet, ready for review."
  apps: "Webhooks by Zapier, Google Drive, Google Sheets"
  category: "Engineering"
  job: "Ml ops AI operations"
  source: "https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/log-model-evaluation-metrics-to-central-results-sheet"
---

# Log model evaluation metrics to central results sheet

## What it does

1. **Trigger:** a prediction batch arrives at a Webhooks by Zapier catch hook (the evaluation service posts JSON to it).
2. **Google Drive** finds the targets file by exact name (first match) and downloads its contents.
3. The workflow parses the targets, selects the entries for the batch's `workshop`, pairs each prediction with its target by `id`, and computes:
   - total RMSE across all paired predictions;
   - high-error RMSE across errors whose absolute value is at least 1.0 (0 if none).
     If no targets match the workshop, or no predictions pair with a target, the run stops and writes nothing.
4. **Google Sheets** appends one new row with the batch ID, submission time, workshop, team, both RMSE values and the profit estimate.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-drive`: the Google Drive account that holds the targets file. Use a work or test account.
   - `google-sheets`: the Google Sheets account that owns the results sheet.
3. **Constants** (each has a comment in `workflow.ts`):
   - `TARGETS_FILE_NAME`: exact name of the targets JSON file in Drive.
   - `SPREADSHEET_ID`: the long ID in the results sheet's URL.
   - `WORKSHEET_ID`: the tab. The first tab is `"0"`.
   - `BATCH_ID_COLUMN` … `PROFIT_ESTIMATE_COLUMN`: column keys such as `COL$A`, not header names. Map the sheet's headers to column letters.
   - `HIGH_ERROR_THRESHOLD`: absolute error at which a prediction counts as high-error (default 1.0).
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point the evaluation service at.

## Ask the user

- Which Drive file holds the targets, and what is its exact name?
- What JSON layout does that file use? The workflow assumes `{ "<workshop>": [{ "id": ..., "actual": number }] }`. If it differs, change the lookup code before installing.
- Which sheet and tab collect the results, and which columns hold each field?
- What is the high-error threshold, if not 1.0? And how is the profit estimate computed, if it should be more than a pass-through of the payload's `profit_estimate`?

## Test

To test, use a sample batch whose `workshop` and prediction `id`s exist in the targets file, for example:

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

Run it as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Check that exactly one row was appended with the right batch ID and workshop, that the RMSE values match a hand calculation from the targets file, and that the row is the one you expect in the sheet. Then tell the user to delete the test row.

## Customize

- **Alert on high error:** add a Slack or email step when the high-error RMSE exceeds a configured threshold.
- **Keep raw samples:** write the paired predictions and targets to a second worksheet for post-mortem analysis.

## Notes

- Skipped batches write nothing and notify no one. A failed Drive or Sheets call stops the run with an error.
- Google Sheets may show the timestamp in the sheet's own format and time zone.
- Never commit a real spreadsheet ID, file name or webhook URL. Anyone with the webhook URL can write rows to the sheet.
