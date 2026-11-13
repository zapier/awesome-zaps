---
name: send-approval-nudge-for-procurement-requests-to-approver
description: Build a Zap on Zapier that catches a procurement request webhook and sends the named approver a Slack direct message with the request's title, vendor, cost center, a short summary and a link to the record. Use when purchase requests wait on an approver and someone needs a quick nudge the moment a request reaches the approval phase.
license: MIT
metadata:
  author: zapier
  summary: "When a procurement request reaches approval, the approver gets a Slack message with the key details and a link, so requests stop sitting unseen."
  apps: "Webhooks by Zapier, Slack"
  category: "Business Owners"
  job: "Procurement operations"
  source: "https://zapier.com/automations/business-owners/procurement-operations/procurement-workflow-management/send-approval-nudge-for-procurement-requests-to-approver"
---

# Send approval nudge for procurement requests to approver

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-approval-nudge-for-procurement-requests-to-approver. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a procurement system posts a request to the Webhooks by Zapier catch hook (`webhook`, `hook_v2`). The payload must carry `record_id`, `approver_email` and `phase`.
2. **Phase check:** if the request's `phase` is not the approval phase, the run stops and sends nothing.
3. **Slack** finds the approver by the `approver_email` in the payload. If no Slack user matches, the run stops and sends nothing.
4. **Slack** sends the approver a direct message: the request title, vendor, cost center, requester, the summary if there is one, and a link to the record.

Anyone with the catch-hook URL can post requests into this Zap, so keep that URL private.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                     | Where       | What goes there                                                                                    |
| --------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `REPLACE_RECORD_URL_PREFIX` | `config.ts` | The start of the procurement system's request page URL, up to the request ID and ending in a slash |

Defaults worth reviewing with them:

- `APPROVAL_PHASE`: the exact phase string that means "waiting for approval" in their system. Defaults to `"Awaiting approval"`.

Prerequisite questions:

- Does the procurement system send the payload's fields as `record_id`, `approver_email`, `phase`, `title`, `vendor`, `cost_center`, `requester_email` and `summary`? If it uses other names, rename them in `workflow.ts` before building.
- Should the nudge go to each approver directly (the default), or to a team channel for group approvals?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace where approvers sit. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack action's fields with the user's connection before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with an approver email that has a Slack account in the connected workspace, and with the request URL pointed at a page the user controls:

```json
{
  "record_id": "PR-INSTALL-TEST-1001",
  "approver_email": "approver@example.com",
  "title": "[install-test] Office chairs",
  "phase": "Awaiting approval",
  "vendor": "[install-test] Example Furniture Co",
  "cost_center": "CC-000 (test)",
  "requester_email": "requester@example.com",
  "summary": "[install-test] 12 ergonomic chairs, $4,800 total"
}
```

Check that the run finishes with both steps completed, that the output has `sent: true`, and that the approver receives one direct message with the title, vendor, cost center, requester, summary and an `Open request PR-INSTALL-TEST-1001` link. If run-status tools aren't available, check the result in Slack directly. Then publish, confirm the trigger is active, and do the real thing once. Ask the user to delete the test message, not the agent.

## Notes

- A request whose approver is not in Slack is skipped, not retried. The run output says `approver-not-found`, so check the run log if nudges go missing.
- The Zap reads everything from the webhook payload and doesn't call the procurement system. Add a step that fetches the full request if the payload is too thin.
- To send to a team channel instead of a direct message, change the Slack action to post to that channel.
- To copy the requester's manager on high-value requests, add a second Slack message gated on a cost threshold.
