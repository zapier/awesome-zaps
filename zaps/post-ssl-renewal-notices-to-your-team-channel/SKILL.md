---
name: post-ssl-renewal-notices-to-your-team-channel
description: Build a Zap on Zapier that watches Gmail for SSL certificate renewal and failure emails and posts each one to your team's Slack channel, with the sender, subject, a short preview and a link back to the original email. Use when a certificate renewal or failure notice should reach the ops or technical lead quickly for triage, instead of sitting in one person's inbox.
license: MIT
metadata:
  author: zapier
  summary: "When a certificate renewal or failure email arrives, its details are posted to your team channel with a link to the original, so the right person sees it at once."
  apps: "Gmail, Slack"
  category: "IT"
  job: "Security operations"
  source: "https://zapier.com/automations/it/security-operations/ssl-certificate-management/post-ssl-renewal-notices-to-your-team-channel"
---

# Post SSL renewal notices to your team channel

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-ssl-renewal-notices-to-your-team-channel. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail email matches the search `subject:(certificate OR SSL OR TLS) in:inbox` (`gmail`, `search`).
2. **Filter (in code):** the subject and body must contain a word starting with `renew`, `expir` or `fail`. Other messages stop the run and post nothing.
3. **Slack:** one message is posted to the team channel. The first line is the sender's name (or address), then the subject in bold, then the first 300 characters of the body, then a link to the original email. Mentions and link previews are switched off, so a notice never pings the whole channel.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `SLACK_CHANNEL` | The channel that gets the notices, looked up from the user's Slack connection. The Slack app must be in that channel. |

Also review the defaults with them: the trigger search (`subject:(certificate OR SSL OR TLS) in:inbox`, set on the trigger; add a `from:` sender to narrow it), `RENEWAL_PATTERN` (the words `renew…`, `expir…` and `fail…` that mark a notice) and `PREVIEW_LENGTH` (`300` body characters).

Confirm with them as well:

- Which Gmail account receives the certificate emails, and which sender or subject words identify them?
- Should the renewal and failure words differ from the defaults?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` (used by the workflow's post) to the user's Slack connection for the workspace with the team channel, and `gmail` (used by the trigger) to the Gmail account that receives the certificate emails. Both apps need a connection; no other apps are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test before publishing (`run_workflow_draft` in Zapier MCP). Use a test channel, not the team's real one. The sample is labelled `[install-test]` and matches the fields the Gmail trigger declares:

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

Check that the run finished and that one message appeared in the test channel with the sender in bold, the subject in bold, the preview and the link. If run-status tools aren't available, check the test channel in Slack directly. Ask the user to delete the test message, since the user deletes test data, not the agent. Then publish, and confirm the trigger is active.

## Notes

- The Gmail search is set on the trigger, not in code. If you change `RENEWAL_PATTERN` but not the trigger search, emails that the search never matches will never reach the filter.
- Gmail's message link opens the original email in the connected account, so only people with access to that inbox can follow it. Anyone who can post to the channel sees its notices.
- To also DM the owner for high-severity failures, add a second Slack step after the channel post, filtered on the failure words. To create a task for critical expirations, add a task step after the Slack post, filtered on the expiry words.
