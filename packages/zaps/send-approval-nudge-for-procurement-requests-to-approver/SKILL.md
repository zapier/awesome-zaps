---
name: send-approval-nudge-for-procurement-requests-to-approver
description: Build a Zapier Next Gen Zap that catches a procurement request webhook and sends the named approver a Slack direct message with the request's title, vendor, cost center, a short summary and a link to the record. Use when purchase requests wait on an approver and someone needs a quick nudge the moment a request reaches the approval phase.
metadata:
  author: zapier
  summary: "When a procurement request reaches approval, the approver gets a Slack message with the key details and a link, so requests stop sitting unseen."
  apps: "Webhooks by Zapier, Slack"
  category: "Business Owners"
  job: "Procurement operations"
  source: "https://zapier.com/automations/business-owners/procurement-operations/procurement-workflow-management/send-approval-nudge-for-procurement-requests-to-approver"
---

# Send approval nudge for procurement requests to approver

## What it does

1. **Trigger:** a procurement system posts a request to a Webhooks by Zapier catch hook.
2. **Phase check:** if the request's `phase` is not the approval phase, the run stops and sends nothing.
3. **Slack** finds the approver by the `approver_email` in the payload. If no Slack user matches, the run stops and sends nothing.
4. **Slack** sends the approver a direct message: the request title, vendor, cost center, requester, the summary if there is one, and a link to the record.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the Slack connection for the workspace where approvers sit. The build used a test workspace connection; use your own workspace connection in production.
3. **Constants:**
   - `APPROVAL_PHASE`: the exact phase string that triggers a nudge. Defaults to `"Awaiting approval"`.
   - `RECORD_URL_PREFIX`: the start of your procurement system's request URL. The record ID is appended to it.

The payload must carry `record_id`, `approver_email` and `phase`. `title`, `vendor`, `cost_center`, `requester_email` and `summary` are optional and show as "not given" when missing.

## Ask the user

- Which procurement system sends the webhook, and what is the URL of a request page there? That becomes `RECORD_URL_PREFIX`.
- What are the payload's field names? The code assumes `record_id`, `approver_email`, `phase`, `title`, `vendor`, `cost_center`, `requester_email` and `summary`. If the sender uses other names, rename them in the code before installing.
- What exact string does the request carry when it is waiting for approval? The default is `Awaiting approval`.
- Should the nudge go to the approver directly (the default here), or to a team channel for group approvals?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use an approver email that has a Slack account in the connected workspace, and replace the test values with your own where needed:

```json
{
  "record_id": "PR-INSTALL-TEST-1001",
  "approver_email": "YOUR_APPROVER_EMAIL",
  "title": "[install-test] Office chairs",
  "phase": "Awaiting approval",
  "vendor": "[install-test] Example Furniture Co",
  "cost_center": "CC-000 (test)",
  "requester_email": "YOUR_REQUESTER_EMAIL",
  "summary": "[install-test] 12 ergonomic chairs, $4,800 total"
}
```

Check that the run finishes with both steps completed, that the output has `sent: true`, and that the approver receives one direct message containing the title, vendor, cost center, requester, summary and the `Open request PR-INSTALL-TEST-1001` link. The link points at the placeholder `RECORD_URL_PREFIX` in the test copy, so it will not open a real page until you set the prefix.

## Customize

- **Team channel for group approvals:** send to a team channel instead of a direct message.
- **Manager on high-value requests:** add the requester's manager as an extra recipient when the request is over a threshold.

## Notes

- A request whose approver is not in Slack is skipped, not retried. The run output says `approver-not-found`, so check the run log if nudges go missing.
- The source automation first calls the procurement system's API with the record ID to get the full request. No system was named in the source, so this zap reads everything from the webhook payload instead. Add a `sdk.runAction` or `sdk.fetch` step if the payload is too thin.
- The source's Formatter and Code steps (turning a field list into text, then parsing it) are replaced by reading the payload's fields directly, since a webhook can send JSON.
- Anyone with the catch-hook URL can post requests into this flow, so keep that URL private.
