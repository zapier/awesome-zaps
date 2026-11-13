---
name: create-a-new-customer-support-channel-and-invite-owners
description: Build a Zap on Zapier that, when another Zap or workflow calls it with a customer reference, a short title and an owner's Slack ID, creates a dedicated Slack channel for that customer, invites the owner and a support group, and returns the new channel ID. Use when a team spins up one Slack channel per customer or project and wants it created the same way every time from other automations.
license: MIT
metadata:
  author: zapier
  summary: "When another automation hands it a new customer, a Slack channel is created for them, the account owner and your support team are invited, and the channel ID is passed back."
  apps: "Sub-Zap by Zapier, Slack"
  category: "Business Owners"
  job: "Team communication"
  source: "https://zapier.com/automations/business-owners/team-communication/slack-integration/create-a-new-customer-support-channel-and-invite-owners"
---

# Create a new customer support channel and invite owners

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-a-new-customer-support-channel-and-invite-owners. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** another Zap or workflow calls this one through `sub-zap-by-zapier` (`start_subzap`), passing `customer_reference`, `brief_title` and `owner_slack_id`. Set the trigger's `input_list` to those three keys so the input matches the code.
2. The channel name is built from `CHANNEL_PREFIX`, the customer reference and the title, lowercased and stripped to the characters Slack allows (for example `cust-acme-42-onboarding`).
3. **`slack`** creates the channel. If Slack says the name is taken, it tries `-2`, `-3` and so on, up to `MAX_NAME_ATTEMPTS`. Any other error stops the run.
4. **`slack`** invites the owner by Slack user ID. If `owner_slack_id` is empty, this step is skipped.
5. **`slack`** invites the support group in `SUPPORT_USER_IDS`. If the list is empty, this step is skipped.
6. The workflow returns `channel_id`, `channel_name`, and whether the owner and support members were invited, so the calling automation can use the channel.

The run creates a real public channel in the Slack workspace, so test with a reference that is obviously a test.

## Ask the user

Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting            | Where         | What goes there                                                                                                                                                                |
| ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SUPPORT_USER_IDS` | `workflow.ts` | Slack user IDs (`U…`) of the support members to invite to every channel. Look them up by name or email with the user's `slack` connection. Leave it empty to skip that invite. |

Also review the defaults with them: `CHANNEL_PREFIX` (`"cust"`) and `MAX_NAME_ATTEMPTS` (`5`).

- Which Slack workspace should create the channels? The answer decides the `slack` account in Build it.
- Should the channels be public? Slack's Create Channel action makes public channels; see Notes for private channels.
- Will calling automations send the owner as a Slack user ID? If they only have an email, add a Slack Find User by Email step to the calling Zap before it calls this one.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace where customer channels belong. That account creates the channel, so it must be allowed to create channels. `sub-zap-by-zapier` needs no account: its trigger runs with `authentication_id` set to null.
2. **Source:** publish `workflow.ts` and `config.ts`, and set `SUPPORT_USER_IDS` in `workflow.ts` from the user's answer. `triggers/start-subzap.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. Use the user's own Slack ID as the owner, or leave it empty. The run creates a real public channel, so keep the reference obviously a test:

```json
{
  "customer_reference": "TEST-001",
  "brief_title": "Install test",
  "owner_slack_id": ""
}
```

Check that:

- a channel named `cust-test-001-install-test` now exists, and the run output's `channel_id` matches it;
- a second run with the same input creates `cust-test-001-install-test-2`;
- with an owner ID, the owner is a member; with `SUPPORT_USER_IDS` set, those people are members.

If run-status tools aren't available, check the result in Slack directly. Ask the user to delete the test channels in Slack; the agent does not delete them. Then publish and confirm the trigger is active.

## Notes

- **Return value:** a durable workflow has no "Return from Sub-Zap" step. Its return value (`channel_id`, `channel_name`, …) is the run's output. Check that the calling Zap's "Call a Sub-Zap" step receives it before relying on it downstream.
- **Public or private:** Slack's Create Channel action makes public channels and has no visibility option. For a private channel, replace that step with Slack's `conversations.create` API call (`is_private: true`) through the Slack connection.
- **Invites:** the connected Slack account creates the channel and is already a member. Slack rejects inviting yourself, so don't put that account's ID in `SUPPORT_USER_IDS` or send it as the owner. One invalid ID fails that invite step, and with it the run, after the channel already exists.
- **Names:** channel names are capped at 80 characters, so long titles are cut to leave room for a `-N` suffix. Only a "name taken" error triggers the suffix retry.
- **Customize:** after the invites, post a welcome message with an onboarding checklist to the new channel (Slack Send Channel Message), or set the topic from an onboarding milestone (Slack Set Channel Topic).
- Never commit real Slack user IDs or the trigger's webhook URL.
