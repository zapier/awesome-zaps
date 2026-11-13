---
name: add-free-trial-buyers-to-sales-outreach-list
description: Build a Zap on Zapier that takes each new free-trial signup from an ActiveCampaign automation webhook, creates or updates the contact, adds them to your sales outreach list and tags them as a trial buyer. Use when a sales team wants trial signups to enter an outreach list the moment they arrive, without anyone copying contacts by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every new free-trial signup is added to your sales outreach list automatically, so the sales team can start reaching out straight away."
  apps: "ActiveCampaign"
  category: "Sales"
  job: "Outbound sales"
  source: "https://zapier.com/automations/sales/outbound-sales/prospecting/add-free-trial-buyers-to-sales-outreach-list"
---

# Add free trial buyers to sales outreach list

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-free-trial-buyers-to-sales-outreach-list. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an automation in ActiveCampaign sends a webhook for a trial signup (`activecampaign`, `new_automation_webhook`).
2. **ActiveCampaign** creates the contact, or updates it if one with the same email already exists.
3. **ActiveCampaign** subscribes that contact to your outreach list.
4. **ActiveCampaign** adds a trial-buyer tag to the contact. This step can be switched off with a setting.

Signups with no email address are skipped.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | What goes there                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_OUTREACH_LIST_ID` | The ActiveCampaign list the sales team works from. Ask which list it is, then look it up by name with their ActiveCampaign connection. Every trial signup is added to it. |

Also review the defaults with them:

- `TRIAL_TAG` (`config.ts`): the tag added to each trial buyer. It is `Trial buyer` by default.
- `ADD_TRIAL_TAG` (`workflow.ts`): `true` adds the tag. Set it to `false` to skip tagging.

Before building, confirm the automation's webhook sends `contact__email`, `contact__first_name`, `contact__last_name` and `contact__id`. If it sends them under other names, change the input schema in `workflow.ts` first.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `activecampaign` to the user's ActiveCampaign connection. The trigger and every action use it.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-automation-webhook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connection and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Once published and the trigger is active, give the user the webhook URL to point their ActiveCampaign automation at.

## Test it

Run it once as a draft test with a sample contact that the user controls:

```json
{
  "contact__email": "jane.buyer@example.com",
  "contact__first_name": "Jane",
  "contact__last_name": "Buyer",
  "contact__id": "1234"
}
```

Check that the contact exists in ActiveCampaign, is subscribed to the outreach list, and carries the trial-buyer tag. If run-status tools aren't available, check the result in ActiveCampaign directly. Then ask the user to delete the test contact if it was not a real signup. The agent doesn't delete test data.

## Notes

- A webhook payload without an email address is skipped. The run finishes with `skipped: true` and writes nothing.
- To start an onboarding automation instead of adding to the list, or to add only signups that meet a plan or flag condition, change the steps after the contact is created.
- The outreach list ID is specific to one ActiveCampaign account, and anyone who can post to the webhook URL can add contacts to the list. Keep both private.
