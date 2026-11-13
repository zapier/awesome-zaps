---
name: post-model-monitoring-emails-to-data-science-channel
description: Build a Zap on Zapier that watches a Gmail inbox for model monitoring alert emails and posts each one's subject and a short snippet to a Slack channel for the data science team. Use when model monitoring tools email alerts and the team wants them triaged in Slack without anyone forwarding them by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a model monitoring alert email arrives, its subject and a short snippet are posted to your data science Slack channel with a link to the original, so the team sees it right away."
  apps: "Gmail, Slack"
  category: "Engineering"
  job: "Ml ops AI operations"
  source: "https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/post-model-monitoring-emails-to-data-science-channel"
---

# Post model monitoring emails to data science channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-model-monitoring-emails-to-data-science-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new email arrives in the Gmail Inbox (`gmail`, `message`).
2. **Filter:** if neither the subject nor the body contains one of the alert keywords (`alert`, `monitoring`, `drift`, `threshold`, case-insensitive), the run stops and posts nothing.
3. **Format:** the subject becomes the heading `Model monitoring alert: <subject>`. The body is flattened to one line and trimmed to 400 characters. A link to the original email is added when Gmail provides one.
4. **Slack** posts that text as one message to the configured channel. No one is mentioned unless `MENTION_PREFIX` is set.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                                   |
| --------------- | ----------------------------------------------------------------- |
| `SLACK_CHANNEL` | The Slack channel that receives the alert posts, as its ID (`C…`) |

Also review the defaults with them:

- `ALERT_KEYWORDS` (in `workflow.ts`): words that mark an email as an alert. The defaults are a guess; match them to your monitoring tool's email wording.
- `MENTION_PREFIX`: empty, so no one is pinged. Set it to `"<!channel> "` to ping the channel for each alert.
- `ALERT_HEADER`: the text before each subject. Default `Model monitoring alert`.
- `BODY_SNIPPET_LENGTH` (in `workflow.ts`): how many characters of the body to post. Default 400.

Prerequisite question: which Gmail mailbox receives the monitoring alerts? The trigger reads that account's Inbox.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the data science channel, and `gmail` (the trigger's account) to the Gmail connection for the mailbox that receives the alerts. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with the Slack channel set to one the user controls:

```json
{
  "subject": "[install-test] Model drift alert: churn-model threshold breached",
  "body_plain": "[install-test] Synthetic monitoring email. Feature drift score 0.42 exceeded threshold 0.30 on churn-model v3. This is a test message from the install check; no action needed.",
  "message_id": "install-test-msg-001",
  "message_url": "https://mail.google.com/mail/u/0/#inbox/install-test-msg-001"
}
```

Check that one message appears in the channel, with the bold heading `Model monitoring alert: [install-test] …`, the body snippet, and the link line. Then check that an email with no alert keyword in its subject or body (for example, a newsletter) returns `skipped: true` with no Slack post. If run-status tools aren't available, check the result in Slack directly. Then publish, confirm the trigger is active, and ask the user to delete the test message; the agent doesn't delete it.

## Notes

- Each new email posts once per trigger delivery. The Zap doesn't look up earlier Slack posts, so a duplicate delivery could post twice.
- The link line uses Gmail's own message URL, which opens only for the mailbox owner.
- Keep `link_names` and `add_edit_link` off in the Slack step, as written. Otherwise Slack may ping people or add an automation link to each alert.
- To extend it: DM the on-call owner based on tags in the subject, or open an incident ticket in your tracking tool, as a step after the Slack post.
