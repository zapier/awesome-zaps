---
name: post-ai-triage-suggestion-into-incident-management-channel
description: Build a Zapier Next Gen Zap that reads each new message in an incident channel, has AI by Zapier suggest the owning team, confidence and rationale, and posts that suggestion as a threaded reply. Use when an IT or incident-response team wants incoming incident reports in Microsoft Teams routed to the right owner without someone reading every message first.
metadata:
  author: zapier
  summary: "Each new incident message gets a suggested owning team, a confidence level and a one-line reason, posted as a threaded reply so the right people see it first."
  apps: "AI by Zapier, Microsoft Teams"
  category: "IT"
  job: "Incident response"
  source: "https://zapier.com/automations/it/incident-response/incident-triage/post-ai-triage-suggestion-into-incident-management-channel"
---

# Post AI triage suggestion into incident management channel

## What it does

1. **Trigger:** a new message in the incident channel (Microsoft Teams, "New Channel Message"). Not yet configured in this draft; it needs the team and channel picked from a Teams connection.
2. **AI by Zapier** reads the message's subject and body against your capability-to-team mapping and returns the matching capability, the owning team or teams, a confidence level (high, medium or low) and one sentence of rationale.
3. **Microsoft Teams** posts that result as a threaded reply to the original message. Medium confidence is labelled as advisory. Nothing is assigned automatically.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Microsoft Teams, New Channel Message (`microsoft-teams` / `messageList`). Pick the team and channel from the Teams connection. The Zapier app must be installed in that team.
2. **Connections** (each alias in the code is the app's slug):
   - `microsoft-teams`: the user's Microsoft Teams connection, for an account that can post in the incident channel.
   - `ai`: no connection. It uses Zapier-managed model credentials (`authentication_id: "0"`).
3. **Constants:**
   - `INCIDENT_TEAM_ID`: the Teams team that contains the incident channel.
   - `INCIDENT_CHANNEL_ID`: the incident channel. Only messages from this channel are triaged.
   - `CAPABILITY_TO_TEAM_MAP`: one line per capability, naming the team that owns it.
4. Test with the steps below, then publish, wait until the trigger is active, and then point the user at the editor link.

## Ask the user

- Which Teams team and channel are the incident channel?
- Which capabilities does each team own? Put that in `CAPABILITY_TO_TEAM_MAP`.
- Does the trigger's output name the message ID, subject and body differently? `workflow.ts` assumes `id`, `subject` and `body`.

## Test

The sample input to use on the first draft test run, with a real message ID from the incident channel:

```json
{
  "id": "YOUR_MESSAGE_ID",
  "subject": "Checkout failing for EU customers",
  "body": "Since 09:40 UTC, card payments return a 500 error for EU-based accounts."
}
```

Check that: the AI step returns `matched_capability`, `owning_teams`, `confidence` and `rationale`; the reply is posted as a thread under the original message; and the reply text has the four lines. Test replies only in a test channel, not in a live incident channel.

## Customize

- **Create a ticket** in your issue tracker on high-confidence matches.
- **Send a direct message** to an incident coordinator for low-confidence items.

## Notes

- Medium-confidence suggestions are advisory and are labelled as such in the reply.
- Duplicate deliveries are not filtered. The workflow keeps no record between runs, so a message delivered twice gets two replies.
- Never commit a real team ID, channel ID or capability mapping that names internal teams.
