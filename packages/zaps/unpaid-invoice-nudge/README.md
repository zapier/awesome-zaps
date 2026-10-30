# Unpaid invoice nudge

Three days after an invoice is due, the customer gets a friendly reminder in your voice. Still unpaid on day 7, you get a text.

**Apps:** QuickBooks Online, Webhooks by Zapier, AI by Zapier, Gmail, SMS by Zapier

## How it works

**Starts with:** QuickBooks Online New Invoice or Webhooks by Zapier Catch Hook

1. Wait until 3 days after the due date
2. Check the invoice is still unpaid (Find Invoice in QuickBooks, or the status URL on the webhook path) (QuickBooks Online). Stops if the invoice is paid.
3. Draft a polite reminder in the owner's voice (AI by Zapier)
4. Email the customer the reminder (Gmail)
5. Wait 4 more days (day 7 for an on-time invoice)
6. Check the invoice again (QuickBooks Online). Stops if the invoice is paid.
7. Text the owner who still owes what (SMS by Zapier)

## What you need

- Gmail
- SMS by Zapier
- QuickBooks Online, when using the QuickBooks Online trigger

## Install it

Paste this into Claude, ChatGPT, Cursor, or any agent with [Zapier MCP](https://zapier.com/mcp) connected:

> Install the Next Gen Zap at https://zapier.sh/zaps/unpaid-invoice-nudge using Zapier MCP.

If you have this repo, the files in this folder are everything the agent needs: it follows `SKILL.md` and deploys `workflow.ts`.

## Files

- `workflow.ts`: the Next Gen Zap code
- `SKILL.md`: how an agent builds it, what to ask you, and how to test it
