---
name: create-kyc-packet-and-post-notification-to-channel
description: Build a Zapier Next Gen Zap that takes a fund's document request by webhook, creates a KYC packet from the Google Docs template for its entity type in your compliance folder, and posts a link to the packet in a Slack channel for portfolio ops and compliance. Use when a fund-onboarding or compliance team generates KYC/AML packets by hand and wants the packet and the reviewer alert created together.
metadata:
  author: zapier
  summary: "When a fund's document request comes in, a KYC packet is created from the right template in your compliance folder and the reviewers get a Slack message with the link."
  apps: "Webhooks by Zapier, Google Docs, Slack"
  category: "Legal"
  job: "Regulatory compliance"
  source: "https://zapier.com/automations/legal/regulatory-compliance/aml-kyc-compliance/create-kyc-packet-and-post-notification-to-channel"
---

# Create KYC packet and post notification to channel

## What it does

1. **Trigger:** a document request arrives at a Webhooks by Zapier catch hook (your fund-intake form or script posts the submission to it).
2. **Route:** the workflow reads `entity_type` and picks the Google Docs template for that entity type. An entity type with no template stops the run and writes nothing.
3. **Google Docs** creates a new packet from that template in the compliance folder, fills in the fund's EIN, formation date, registration info, fund name, GP details and today's date, and shares it as view-only by link. The PDF export is created too.
4. **Slack** posts one message to the reviewer channel with the packet's title, owner, document link and PDF link. The reviewer group is not mentioned unless you turn that on.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Webhooks by Zapier, Catch Hook (`webhook`, `hook_v2`). It needs no connection, so its `authentication_id` is `null`.
2. **Connections** (each alias in the code is the app's slug):
   - `google-docs`: the user's Google Docs connection, for the account that owns the templates and the compliance folder. It needs write access to that folder.
   - `slack`: the user's Slack connection for the workspace that owns the reviewer channel.
3. **Constants:**
   - `TEMPLATE_IDS`: one Google Docs template ID per entity type, keyed by the lowercase `entity_type` the webhook sends (`llc`, `lp` by default). Add or remove keys to match the fund types you run.
   - `COMPLIANCE_FOLDER`: the Drive folder ID for new packets. Use `"root"` for the top level of My Drive.
   - `SLACK_CHANNEL`: the channel ID (for example `C0123456`) of the reviewer channel.
   - `SHARING_PREFERENCE`: `"reader"` (anyone with the link can view), as the automation specifies. Change it only if reviewers should edit.
   - `MENTION_REVIEWERS`: `false` by default. Set it to `true` to @-mention the reviewer group at the top of the message.
   - `REVIEWER_MENTION`: the Slack user-group mention, such as `<!subteam^S0123456>`. Used only when `MENTION_REVIEWERS` is `true`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook URL to point their intake system at.

## Ask the user

- Which template document does each entity type use, and what are the template's placeholder names? The workflow sends `EIN`, `formation_date`, `registration_info`, `fund_name`, `gp_details` and `date`. Rename the keys in `workflow.ts` to match the template's placeholders.
- Which Drive folder is the compliance folder, and which Slack channel do reviewers read?
- Should the reviewer group be @-mentioned? If yes, set `MENTION_REVIEWERS` and `REVIEWER_MENTION`.
- Does the intake system send the fields under these names: `fund_name`, `entity_type`, `ein`, `formation_date`, `registration_number`, `gp_name` or `gp_details`, and `owner`? The code reads them by these names.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a fund name that makes the test document easy to find and delete:

```json
{
  "fund_name": "[install-test] Example Fund I",
  "entity_type": "llc",
  "ein": "00-0000000",
  "formation_date": "2020-01-15",
  "registration_number": "TEST-0001",
  "gp_name": "Example GP LLC",
  "owner": "ops-team"
}
```

Check that one new document named after the fund exists in the compliance folder with the placeholders filled and sharing set to view-only by link. Check that one message with its link appeared in the reviewer channel. Then delete the test document and tell the reviewers the test message was a test.

## Customize

- **Urgent direct message:** send a direct message to the assigned owner for urgent reviews.
- **Task tracker:** export the document as PDF and attach it to a downstream task tracker.

## Notes

- Packets are shared by link, so anyone with the link can view the document. Keep `SHARING_PREFERENCE` at `"reader"` unless your policy allows more.
- The workflow creates the document before it posts, so if the Slack step fails the packet still exists. Check the channel for a missing message before re-running, or the reviewers will not see that packet.
- Never commit a real template ID, folder ID, channel ID or webhook URL. Anyone with the webhook URL can create packets in your folder.
