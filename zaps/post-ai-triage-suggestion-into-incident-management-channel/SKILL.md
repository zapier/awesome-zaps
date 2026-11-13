---
name: post-ai-triage-suggestion-into-incident-management-channel
description: Build a Zap on Zapier that reads each new message in an incident channel, has AI by Zapier suggest the owning team, confidence and rationale, and posts that suggestion as a threaded reply. Use when an IT or incident-response team wants incoming incident reports in Microsoft Teams routed to the right owner without someone reading every message first.
license: MIT
metadata:
  author: zapier
  summary: "Each new incident message gets a suggested owning team, a confidence level and a one-line reason, posted as a threaded reply so the right people see it first."
  apps: "AI by Zapier, Microsoft Teams"
  category: "IT"
  job: "Incident response"
  source: "https://zapier.com/automations/it/incident-response/incident-triage/post-ai-triage-suggestion-into-incident-management-channel"
---

# Post AI triage suggestion into incident management channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-ai-triage-suggestion-into-incident-management-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new message in the incident channel (`microsoft-teams`, `messageList`). The trigger brings the message ID, subject and body.
2. **AI by Zapier** reads the message's subject and body against the capability-to-team mapping and returns the matching capability, the owning team or teams, a confidence level (high, medium or low) and one sentence of rationale.
3. **Microsoft Teams** posts that result as a threaded reply to the original message.

Medium confidence is labelled as advisory in the reply. Nothing is assigned automatically; a person routes the incident.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve team and channel names to IDs with the user's Microsoft Teams connection; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `INCIDENT_TEAM_ID`       | The Teams team that contains the incident channel                                                               |
| `INCIDENT_CHANNEL_ID`    | The incident channel in that team. Only its messages are triaged                                                |
| `CAPABILITY_TO_TEAM_MAP` | One line per capability, naming the team that owns it, e.g. `Payments: Payments team`. Ask which team owns what |

Prerequisites and questions from the old setup:

- The Zapier app must be installed in that Teams team.
- Does the trigger's output name the message ID, subject and body differently? `workflow.ts` assumes `id`, `subject` and `body`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `microsoft-teams` to the user's Microsoft Teams connection, for an account that can post in the incident channel. The trigger and the reply use the same one. `ai` needs no connection; it uses Zapier-managed model credentials.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/message-list.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test with a message the user posted in a test channel. Set `id` to that message's ID, or the reply step fails:

```json
{
  "id": "1700000000001",
  "subject": "Checkout failing for EU customers",
  "body": "Since 09:40 UTC, card payments return a 500 error for EU-based accounts."
}
```

Check that the AI step returns `matched_capability`, `owning_teams`, `confidence` and `rationale`, that the reply is posted as a thread under that message, and that the reply has the four lines: suggested owner, capability, confidence and why. If run-status tools aren't available, check the reply in Microsoft Teams directly. Then publish, confirm the trigger is active, and ask the user to delete the test messages.

## Notes

- Medium-confidence suggestions are advisory and labelled as such in the reply.
- Duplicate deliveries are not filtered. The workflow keeps no record between runs, so a message delivered twice gets two replies.
- To create a ticket on high-confidence matches, or to direct-message an incident coordinator on low-confidence ones, add a step after the reply in the helpdesk or chat app.
- Keep real team IDs, channel IDs and capability maps that name internal teams out of commits.
