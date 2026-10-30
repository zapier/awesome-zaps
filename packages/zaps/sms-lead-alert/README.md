# SMS lead alert

Texts you every new lead the moment it comes in: their name, number, what they need, and a reply you can send back.

**Apps:** Webhooks by Zapier, AI by Zapier, SMS by Zapier (optional: Facebook Lead Ads)

## How it works

**Starts with:** Webhooks by Zapier Catch Hook (optionally also Facebook Lead Ads New Lead)

1. Pull out name, phone and need, and draft a reply (AI by Zapier)
2. Text the owner the lead (SMS by Zapier)

## What you need

- SMS by Zapier

## Install it

Paste this into Claude, ChatGPT, Cursor, or any agent with [Zapier MCP](https://zapier.com/mcp) connected:

> Install the Next Gen Zap at https://zapier.sh/zaps/sms-lead-alert using Zapier MCP.

If you have this repo, the files in this folder are everything the agent needs: it follows `SKILL.md` and deploys `workflow.ts`.

## Files

- `workflow.ts`: the Next Gen Zap code
- `SKILL.md`: how an agent builds it, what to ask you, and how to test it
