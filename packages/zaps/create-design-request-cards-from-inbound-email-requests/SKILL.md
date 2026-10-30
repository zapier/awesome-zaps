---
name: create-design-request-cards-from-inbound-email-requests
description: Use when a design or creative team takes requests by email and wants each one to become a Trello card on its intake list, with the subject, the body's details, the contact, the links and any due date filled in. Not for internal chatter or replies; it only acts on emails whose subject matches the request pattern.
metadata:
  author: zapier
  summary: "When a design request arrives by email, a Trello card is created at the bottom of your intake list with the details filled in, so nothing gets lost in an inbox."
  apps: "Email by Zapier, Trello"
  category: "Design"
  job: "Design project management"
  source: "https://zapier.com/automations/design/design-project-management/design-request-intake/create-design-request-cards-from-inbound-email-requests"
---

# Create design request cards from inbound email requests

## What it does

1. **Trigger:** a new email is forwarded to your Email by Zapier address (`inbound_v2`, a custom `zapiermail.com` mailbox).
2. **Filter:** if the subject does not match `SUBJECT_PATTERN`, the run stops and creates nothing.
3. **Format:** the HTML body becomes plain text with normalised line breaks. Contact details, budget lines and URLs are pulled out of it.
4. **Extract:** a due date is read from a phrase such as `Due: 2026-12-01` or `Deadline: December 1, 2026`, if one is present.
5. **Match:** Trello is searched for an open card with the same name and the same received time. If one exists, nothing new is created.
6. **Trello:** otherwise a card is created at the bottom of the intake list, with the body, contact, budget and links in its description and the due date set if one was found.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Email by Zapier, New Inbound Email (`email`, `inbound_v2`). It needs no connection, so `authentication_id` is `null`. Set the trigger parameter `identifier` to the same value as `MAIL_IDENTIFIER`, and leave `account_wide` as `user` unless the team wants a shared address.
2. **Connections** (each alias in the code is the app's slug):
   - `trello`: the Trello account whose board receives the cards.
3. **Constants:**
   - `MAIL_IDENTIFIER`: the name before `@zapiermail.com` that receives the forwarded requests. Lowercase letters and numbers only.
   - `SUBJECT_PATTERN`: the pattern a subject must match to count as a request. Defaults to `/design request/i`.
   - `TRELLO_BOARD_ID`: the board's ID.
   - `TRELLO_INTAKE_LIST_ID`: the ID of the list new request cards go into.

Each constant ships with a placeholder. Replace every one before publishing.

## Ask the user

- What name should the forwarding mailbox use (`MAIL_IDENTIFIER`)? Should it be user-specific or account-wide?
- Which subject marks a design request? Keep the default or give another pattern.
- Which Trello board and intake list should the cards go to?
- Should only certain senders count? The workflow checks the subject only.

## Test

Send a test email to the forwarding mailbox, or run this sample through the workflow's test run, using a test board and list:

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

Delete the test cards afterwards.

## Customize

- **Team chat notification for urgent requests:** add a Slack message after the card step for requests marked urgent.
- **Calendar event on a due date:** create a calendar event when a valid due date is extracted.

## Notes

- Trello stores descriptions as Markdown, so line breaks and links from the email carry over as text.
- Sections are read with simple text rules, not an AI step. A request phrased very differently may give a less complete card, but the full body always stays in the description.
- Contact details go into the description as text, not as card members, because Trello needs member IDs for that.
- The Trello search returns at most 50 open cards, so a very busy board could miss an existing duplicate.
- Never commit a real board ID or mailbox address to a shared copy of this file.
