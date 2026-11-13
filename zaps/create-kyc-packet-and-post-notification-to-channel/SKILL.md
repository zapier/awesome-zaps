---
name: create-kyc-packet-and-post-notification-to-channel
description: Build a Zap on Zapier that takes a fund's document request by webhook, creates a KYC packet from the Google Docs template for its entity type in your compliance folder, and posts a link to the packet in a Slack channel for portfolio ops and compliance. Use when a fund-onboarding or compliance team generates KYC/AML packets by hand and wants the packet and the reviewer alert created together.
license: MIT
metadata:
  author: zapier
  summary: "When a fund's document request comes in, a KYC packet is created from the right template in your compliance folder and the reviewers get a Slack message with the link."
  apps: "Webhooks by Zapier, Google Docs, Slack"
  category: "Legal"
  job: "Regulatory compliance"
  source: "https://zapier.com/automations/legal/regulatory-compliance/aml-kyc-compliance/create-kyc-packet-and-post-notification-to-channel"
---

# Create KYC packet and post notification to channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-kyc-packet-and-post-notification-to-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a document request arrives at a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). Your fund-intake form or script posts the submission to it.
2. **Route:** the workflow reads `entity_type` and picks the Google Docs template for that entity type. An entity type with no template stops the run and writes nothing.
3. **Google Docs** creates a new packet from that template in the compliance folder, fills in the fund's EIN, formation date, registration info, fund name, GP details and today's date, and shares it as view-only by link. The PDF export is created too.
4. **Slack** posts one message to the reviewer channel with the packet's title, owner, document link and PDF link. The reviewer group is not mentioned unless you turn that on.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting             | What goes there                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `COMPLIANCE_FOLDER` | The Drive folder for new packets: pick it with the user's Google Docs connection. `root` means the top level of My Drive      |
| `SLACK_CHANNEL`     | The channel the reviewers read: look it up with the user's Slack connection                                                   |
| `LLC_TEMPLATE_ID`   | The Google Doc template for LLC funds: pick it with the user's Google Docs connection                                         |
| `LP_TEMPLATE_ID`    | The Google Doc template for limited partnership funds: pick it with the user's Google Docs connection                         |
| `REVIEWER_MENTION`  | The Slack user group to @-mention, in the form `<!subteam^S…>`. Only needed if `MENTION_REVIEWERS` is `true` in `workflow.ts` |

Also review the defaults with them: `SHARING_PREFERENCE` (`reader` lets anyone with the link view; change it only if reviewers should edit), `MENTION_REVIEWERS` in `workflow.ts` (`false`; set it to `true` to @-mention the reviewer group), and the `TEMPLATE_IDS` keys (`llc`, `lp`), which must match the `entity_type` the intake sends. Add or remove keys to match the fund types you run.

Before turning it on, confirm the template documents use these placeholder names: `EIN`, `formation_date`, `registration_info`, `fund_name`, `gp_details` and `date`. If they differ, rename the keys in `workflow.ts`. Also confirm the intake system sends `fund_name`, `entity_type`, `ein`, `formation_date`, `registration_number`, `gp_name` or `gp_details`, and `owner` under those names, because the code reads them by these names.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-docs` to the user's Google Docs connection for the account that owns the templates and the compliance folder; it needs write access to that folder. Bind `slack` to the user's Slack connection for the workspace that owns the reviewer channel. The webhook trigger needs no account.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections, and sample the trigger, before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. Use a fund name that makes the test document easy to find and delete:

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

Check that one new document named after the fund exists in the compliance folder, with the placeholders filled and sharing set to view-only by link. Check that one message with its link appeared in the reviewer channel. If run-status tools aren't available, check the result in Google Drive and Slack directly. The user deletes the test document and tells the reviewers the test message was a test; the agent doesn't delete test data. Then publish, and once the trigger is active, give the user their webhook URL to point their intake system at.

## Notes

- Packets are shared by link, so anyone with the link can view the document. Keep `SHARING_PREFERENCE` at `"reader"` unless your policy allows more.
- The packet is created before the Slack message is posted, so if the Slack step fails the packet still exists. Check the channel for a missing message before re-running, or the reviewers will not see that packet.
- To extend it, send a direct message to the assigned owner for urgent reviews, or export the document as PDF and attach it to a downstream task tracker.
- Keep real template IDs, folder IDs, channel IDs and the webhook URL out of any repository. Anyone with the webhook URL can create packets in your folder.
