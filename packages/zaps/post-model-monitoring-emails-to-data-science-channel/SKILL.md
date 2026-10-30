---
name: post-model-monitoring-emails-to-data-science-channel
description: Build a Zapier Next Gen Zap that watches a Gmail inbox for model monitoring alert emails and posts each one's subject and a short snippet to a Slack channel for the data science team. Use when model monitoring tools email alerts and the team wants them triaged in Slack without anyone forwarding them by hand.
metadata:
  author: zapier
  summary: "When a model monitoring alert email arrives, its subject and a short snippet are posted to your data science Slack channel with a link to the original, so the team sees it right away."
  apps: "Gmail, Slack"
  category: "Engineering"
  job: "Ml ops AI operations"
  source: "https://zapier.com/automations/engineering/ml-ops-ai-operations/model-monitoring-alerting/post-model-monitoring-emails-to-data-science-channel"
---

# Post model monitoring emails to data science channel

## What it does

1. **Trigger:** a new email arrives in the Gmail Inbox (`New Email`, label `INBOX`).
2. **Filter:** if neither the subject nor the body contains one of the alert keywords (`alert`, `monitoring`, `drift`, `threshold`, case-insensitive), the run stops and posts nothing.
3. **Format:** the subject becomes the heading `Model monitoring alert: <subject>`. The body is flattened to one line and trimmed to 400 characters. A link to the original email is added when Gmail provides one.
4. **Slack** posts that text as one message to the configured channel. No one is mentioned.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email (`gmail`, `message`, app version 2.14.0). Params: `label_ids: "INBOX"`. Its `authentication_id` is the user's Gmail connection.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the user's Gmail connection for the mailbox that receives the alerts.
   - `slack`: the user's Slack connection for the workspace that has the data science channel.
3. **Constants:**
   - `SLACK_CHANNEL`: the channel's ID (a `C…` value), not its name. In Slack, open the channel's details and copy the ID at the bottom.
   - `ALERT_KEYWORDS`: words that mark an email as an alert. The defaults are a guess; change them to match your monitoring tool's email wording.
   - `BODY_SNIPPET_LENGTH`: how many characters of the body to post. Default 400.
   - `ALERT_HEADER`: the text before each subject. Default `Model monitoring alert`.
   - `MENTION_PREFIX`: leave empty so no one is pinged. To ping the channel, set it to `"<!channel> "`.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their workflow editor link.

## Ask the user

- Which Gmail mailbox or label receives the monitoring alerts? The trigger is set to the Inbox.
- Which Slack channel should receive the posts, and what is its channel ID?
- Which words appear in your monitoring tool's alert emails? The keyword list is a guess.
- Should the channel be pinged for each alert? If yes, set `MENTION_PREFIX`.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. It stands in for the trigger's output, so the Slack post goes to a test channel:

```json
{
  "subject": "[install-test] Model drift alert: churn-model threshold breached",
  "body_plain": "[install-test] Synthetic monitoring email. Feature drift score 0.42 exceeded threshold 0.30 on churn-model v3. This is a test message from the install check; no action needed.",
  "message_id": "install-test-msg-001",
  "message_url": "https://mail.google.com/mail/u/0/#inbox/install-test-msg-001"
}
```

Confirm that one message appeared in the channel, with the bold heading `Model monitoring alert: [install-test] …`, the body snippet, and the link line. Then check that an email with no alert keyword in its subject or body (for example, a newsletter) returns `skipped: true` with no Slack post. Delete the test message afterwards.

## Customize

- **Also DM the on-call owner** based on subject tags: add a second Slack step after the post, keyed on tags in the subject.
- **Create an incident ticket** in your tracking tool instead of, or as well as, the Slack post.

## Notes

- Each new email posts once, because the trigger fires once per new email. The workflow does not look up earlier Slack posts, so a duplicate trigger delivery could post twice.
- The link line uses Gmail's own message URL, which opens only for the mailbox owner.
- Keep `link_names` and `add_edit_link` off in the Slack step, as written. Otherwise Slack may ping people or add an automation link to each alert.
