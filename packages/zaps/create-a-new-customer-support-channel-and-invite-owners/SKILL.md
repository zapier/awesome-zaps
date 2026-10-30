---
name: create-a-new-customer-support-channel-and-invite-owners
description: Build a Zapier Next Gen Zap that, when another Zap or workflow calls it with a customer reference, a short title and an owner's Slack ID, creates a dedicated Slack channel for that customer, invites the owner and a support group, and returns the new channel ID. Use when a team spins up one Slack channel per customer or project and wants it created the same way every time from other automations.
metadata:
  author: zapier
  summary: "When another automation hands it a new customer, a Slack channel is created for them, the account owner and your support team are invited, and the channel ID is passed back."
  apps: "Sub-Zap by Zapier, Slack"
  category: "Business Owners"
  job: "Team communication"
  source: "https://zapier.com/automations/business-owners/team-communication/slack-integration/create-a-new-customer-support-channel-and-invite-owners"
---

# Create a new customer support channel and invite owners

## What it does

1. **Trigger:** another Zap or workflow calls this one through Sub-Zap by Zapier, passing `customer_reference`, `brief_title` and `owner_slack_id`.
2. The channel name is built from `CHANNEL_PREFIX`, the customer reference and the title, lowercased and stripped to the characters Slack allows (for example `cust-acme-42-onboarding`).
3. **Slack** creates the channel. If Slack says the name is taken, it tries `-2`, `-3` and so on, up to `MAX_NAME_ATTEMPTS`. Any other error stops the run.
4. **Slack** invites the owner by Slack user ID. If `owner_slack_id` is empty, this step is skipped.
5. **Slack** invites the support group in `SUPPORT_USER_IDS`. If the list is empty, this step is skipped.
6. The workflow returns `channel_id`, `channel_name`, and whether the owner and support members were invited, so the calling automation can use the channel.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Sub-Zap by Zapier, Start a Sub-Zap (`sub-zap-by-zapier`, `start_subzap`). It needs no connection, so its `authentication_id` is `null`. Set `params.input_list` to `["customer_reference", "brief_title", "owner_slack_id"]`, so the input keys match the code.
2. **Connections** (each alias in the code is the app's slug):
   - `slack`: the user's Slack connection for the workspace where customer channels belong. That account becomes the channel's creator and must be allowed to create channels.
3. **Constants:**
   - `SUPPORT_USER_IDS`: Slack user IDs (`U…`) of the support account or team members to invite to every channel. Look them up with Slack's Find User by Email or Find User by Name. Leave it empty to skip that invite.
   - `CHANNEL_PREFIX`: the prefix for every channel name. Defaults to `"cust"`.
   - `MAX_NAME_ATTEMPTS`: how many names to try when one is taken. Defaults to `5`.
4. Test with the steps below, then publish and wait until the trigger is active. Calling Zaps add a "Call a Sub-Zap" step that points at this workflow.

## Ask the user

- Which Slack workspace connection should create the channels?
- Who is the support "community" to invite: one support account, or several people? Get their Slack user IDs, or emails you can look up.
- What prefix should channel names use? Should the channels be public? Slack's Create Channel action makes public channels; see Notes.
- Will calling automations send the owner as a Slack user ID? If they only have an email, add a Find User by Email step to the calling Zap, or see Customize.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use the user's own Slack ID as the owner, or leave it empty. The run creates a real public channel, so pick a reference that is obviously a test:

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

Then archive the test channels in Slack.

## Customize

- **Welcome message:** after the invites, post a welcome message with an onboarding checklist to the new channel (Slack Send Channel Message, with `channelId`).
- **Channel topic:** set the topic from a mapped onboarding milestone or project tag (Slack Set Channel Topic).

## Notes

- **Return value:** a durable workflow has no "Return from Sub-Zap" step. Its return value (`channel_id`, `channel_name`, …) is the run's output. Check that the calling Zap's "Call a Sub-Zap" step actually receives it before relying on it downstream.
- **Public or private:** Slack's Create Channel action in Zapier has no visibility option and creates a public channel. For private channels, replace that step with Slack's `conversations.create` API call through the Slack connection (`is_private: true`).
- **Invites:** the connected Slack account creates the channel and is already a member. Slack rejects inviting yourself, so don't put that account's ID in `SUPPORT_USER_IDS` or send it as the owner. One invalid ID fails that invite step, and with it the run, after the channel already exists.
- **Names:** Slack channel names are capped at 80 characters, so long titles are cut to leave room for a `-N` suffix. Only a "name taken" error triggers the suffix retry.
- Never commit real Slack user IDs or the trigger's webhook URL.
