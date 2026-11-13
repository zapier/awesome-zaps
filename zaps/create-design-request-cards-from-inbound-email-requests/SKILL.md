---
name: create-design-request-cards-from-inbound-email-requests
description: Build a Zap on Zapier that turns each design request forwarded by email into a Trello card on the design team's intake list, with the subject, the body's details, the contact, the links and any due date filled in. Use when a design or creative team takes requests by email and wants each one on its intake list. Not for internal chatter or replies; it only acts on emails whose subject matches the request pattern.
license: MIT
metadata:
  author: zapier
  summary: "When a design request arrives by email, a Trello card is created at the bottom of your intake list with the details filled in, so nothing gets lost in an inbox."
  apps: "Email by Zapier, Trello"
  category: "Design"
  job: "Design project management"
  source: "https://zapier.com/automations/design/design-project-management/design-request-intake/create-design-request-cards-from-inbound-email-requests"
---

# Create design request cards from inbound email requests

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-design-request-cards-from-inbound-email-requests. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new email is forwarded to your Email by Zapier mailbox (`email`, `inbound_v2`).
2. **Filter:** if the subject does not match `SUBJECT_PATTERN`, the run stops and creates nothing.
3. **Format:** the HTML body becomes plain text with normalised line breaks. Contact details, budget lines and URLs are pulled out of it.
4. **Extract:** a due date is read from a phrase such as `Due: 2026-12-01` or `Deadline: December 1, 2026`, if one is present.
5. **Match:** Trello is searched for an open card with the same name and the same received time. If one exists, nothing new is created.
6. **Trello:** otherwise a card is created at the bottom of the intake list, with the body, contact, budget and links in its description and the due date set if one was found.

The Zap only creates cards. It never replies to the sender.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | Where                                                  | What goes there                                                                                           |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `MAIL_IDENTIFIER`       | `config.ts`, and `identifier` in `triggers/inbound.ts` | The name before `@zapiermail.com` that receives the requests. Lowercase letters and numbers only.         |
| `TRELLO_BOARD_ID`       | `config.ts`                                            | The design project board; look it up with the user's Trello connection                                    |
| `TRELLO_INTAKE_LIST_ID` | `config.ts`                                            | The list new request cards go into: ask which list, then look up its ID with the user's Trello connection |

Also review the defaults with them: `SUBJECT_PATTERN` in `workflow.ts` (`/design request/i`, the pattern a subject must match) and the trigger's `account_wide` (`user`, so the mailbox is the user's own; set it to a shared address only if the team wants one). The workflow checks only the subject, so ask whether only certain senders should count. That needs a change to `workflow.ts`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `trello` (the account whose board receives the cards) to the user's Trello connection. Email by Zapier needs none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/inbound.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample through the workflow's test run, with a test board and list:

```json
{
  "subject": "Design request: homepage refresh",
  "body_html": "<p>Specs: three landing pages, mobile first</p><p>Due: 2026-12-01</p><p>Contact: Jane Doe jane@example.com</p><p>Budget: $5k</p><p>Brief: https://example.com/brief</p>",
  "from_email": "jane@example.com",
  "from_name": "Jane Doe",
  "raw": { "Date": "Thu, 29 Oct 2026 10:15:00 +0000" }
}
```

Check that:

- one card named `Design request: homepage refresh` appears at the bottom of the list;
- its due date is 1 December 2026;
- its description has the received time, the sender, the specs, the contact line, the budget line and the brief link;
- running the same email again creates no second card;
- an email whose subject has no "design request" in it stops with `not-a-design-request` and creates nothing.

If run-status tools aren't available, check the result in Trello directly. Ask the user to delete the test cards; the agent doesn't delete them.

## Notes

- Trello stores descriptions as Markdown, so line breaks and links from the email carry over as text.
- Sections are read with simple text rules, not an AI step. A request phrased very differently may give a less complete card, but the full body always stays in the description.
- Contact details go into the description as text, not as card members, because Trello needs member IDs for that.
- The duplicate check searches at most 50 open cards, so a very busy board could miss an existing duplicate.
- To extend it, add a step after the card: a Slack message for urgent requests, or a calendar event on a valid due date.
- Don't commit a real board ID or mailbox address to a shared copy of this skill.
