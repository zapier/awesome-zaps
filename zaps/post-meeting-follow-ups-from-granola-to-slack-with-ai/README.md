# Post meeting follow-ups from Granola to Slack with AI

Within about an hour of each meeting you record in Granola, you get a Slack DM with what was decided and who owes what. A follow-up email to the other attendees comes with it, ready to paste. AI by Zapier writes both from your Granola notes and the transcript.

**Apps:** Granola, Slack, AI by Zapier, Schedule by Zapier

**Needs:** Granola Business or Enterprise. The free plan has no API access, and the Zap reads your notes through Granola's API.

Granola's paid plans can write a follow-up email inside the app. This Zap sends one to you in Slack with the action items, so you don't have to open Granola. You can also change the prompt that writes it.

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-meeting-follow-ups-from-granola-to-slack-with-ai

The agent follows `SKILL.md`: it asks for a Granola API key and where the follow-ups should go, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Draft the email in Gmail,** addressed to the attendees, so you review it and press send.
- **Write it in your voice:** add a few of your real follow-up emails to the prompt in `config.ts`.
- **One recap at the end of the day,** on a 5 PM schedule, covering every meeting since the morning.
- **Use another notetaker,** like Zoom's meeting summaries. The AI step and the Slack post stay the same.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the time window and the follow-up prompt
- `connections/`: the accounts it uses (`slack`, `ai`)
- `triggers/`: what starts it
