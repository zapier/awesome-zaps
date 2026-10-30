---
name: post-ssl-renewal-notices-to-your-team-channel
description: Build a Zapier Next Gen Zap that watches Gmail for SSL certificate renewal and failure emails and posts each one to your team's Slack channel, with the sender, subject, a short preview and a link back to the original email. Use when a certificate renewal or failure notice should reach the ops or technical lead quickly for triage, instead of sitting in one person's inbox.
metadata:
  author: zapier
  summary: "When a certificate renewal or failure email arrives, its details are posted to your team channel with a link to the original, so the right person sees it at once."
  apps: "Gmail, Slack"
  category: "IT"
  job: "Security operations"
  source: "https://zapier.com/automations/it/security-operations/ssl-certificate-management/post-ssl-renewal-notices-to-your-team-channel"
---

# Post SSL renewal notices to your team channel

## What it does

1. **Trigger:** a new Gmail email matches the search `subject:(certificate OR SSL OR TLS) in:inbox`.
2. **Filter (in code):** the subject and body must contain a word starting with `renew`, `expir` or `fail`. Other messages stop the run and post nothing.
3. **Slack:** one message is posted to the team channel. The first line is the sender's name (or address), then the subject in bold, then the first 300 characters of the body, then a link to the original email. Mentions and link previews are switched off.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Gmail, New Email Matching Search (`gmail`, action `search`). Set its search to the query you want. The query is a trigger setting, not a constant in the code, so change it on the trigger. The default is `subject:(certificate OR SSL OR TLS) in:inbox`. Add a sender with `from:` to narrow it.
2. **Connections** (each alias in the code is the app's slug):
   - `gmail`: the Gmail account that receives the certificate emails.
   - `slack`: the Slack workspace that contains the team channel.
3. **Constants:**
   - `SLACK_CHANNEL`: the channel ID (the long ID in the channel's details, starting with `C`).
   - `RENEWAL_PATTERN`: the words that mark a renewal or failure notice. The default matches `renew…`, `expir…` and `fail…`.
   - `PREVIEW_LENGTH`: how many body characters to include in the message. Default `300`.
4. Test with the steps below, then publish, wait until the trigger is active, and tell the user the workflow is live.

## Ask the user

- Which Gmail account receives the certificate emails, and which sender or subject words identify them? (The default search is subject-based and has no sender filter.)
- Which Slack channel should receive the notices? Use its ID, and make sure the Slack app is in that channel.
- Should the renewal and failure words differ from the defaults?

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing. Use a test channel, not the team's real one. The sample is labelled `[install-test]` and matches the fields the Gmail trigger declares:

```json
{
  "subject": "[install-test] SSL certificate renewal failed for test.example.com",
  "body_plain": "[install-test] The automatic renewal of the SSL certificate for test.example.com failed. The certificate expires in 7 days. Please check the ACME challenge.",
  "from": {
    "name": "[install-test] Certificate Monitor",
    "email": "you@example.com"
  },
  "message_url": "https://mail.google.com/mail/u/0/#inbox/install-test-1"
}
```

Confirm the run finished, and that one message appeared in the test channel with the sender in bold, the subject in bold, the preview and the link. Then delete the test message yourself and check the trigger is active after publishing.

## Customize

- **Also DM the owner** for high-severity failures: add a second Slack step, with its own filter on the failure words, after the channel post.
- **Create a task** in your project tracker for critical expirations: add a task step after the Slack post, with a filter on the expiry words.

## Notes

- Mentions (`@channel`, `@here`, user mentions) are switched off in the Slack step, so a notice never pings the whole channel.
- The Gmail search is set on the trigger, not in code. If you change `RENEWAL_PATTERN` but not the trigger search, emails that the search never matches will never reach the filter.
- Gmail's message link opens the original email in the connected account, so only people with access to that inbox can follow it.
- Never commit a real channel ID or account. Anyone who can post to the channel sees its notices.
