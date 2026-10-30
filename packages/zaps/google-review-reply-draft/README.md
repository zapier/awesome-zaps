# Google review reply draft

Every new review gets a reply drafted in your voice and emailed to you to approve. 1 and 2 stars text you right away. 5 stars land in a testimonials sheet.

**Apps:** Google Business Profile, Webhooks by Zapier, AI by Zapier, SMS by Zapier, Gmail, Google Sheets

## How it works

**Starts with:** Google Business Profile New Review and/or Webhooks by Zapier Catch Hook

1. Read the review and draft a reply (AI by Zapier)
2. **1 or 2 stars:** Text the owner right away (SMS by Zapier)
3. Email the owner the draft to approve (Gmail)
4. **5 stars:** Add the review to the testimonials sheet (Google Sheets)

## What you need

- Google Business Profile, when using the Google Business Profile trigger
- Gmail
- SMS by Zapier
- Google Sheets

## Install it

Paste this into Claude, ChatGPT, Cursor, or any agent with [Zapier MCP](https://zapier.com/mcp) connected:

> Install the Next Gen Zap at https://zapier.sh/zaps/google-review-reply-draft using Zapier MCP.

If you have this repo, the files in this folder are everything the agent needs: it follows `SKILL.md` and deploys `workflow.ts`.

## Files

- `workflow.ts`: the Next Gen Zap code
- `SKILL.md`: how an agent builds it, what to ask you, and how to test it
