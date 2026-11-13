# Add social leads as applicant records in ATS

When someone fills in a Facebook lead form, this creates an applicant record in your applicant tracking system, with the phone number tidied and the name split into first and last.

**Apps:** Facebook Lead Ads, Webhooks by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-social-leads-as-applicant-records-in-ats

The agent follows `SKILL.md`: it asks you which Facebook Page and lead form feed it, for your applicant tracking system's webhook URL and for the stage new applicants land in, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`facebook-lead-ads`)
- `triggers/`: what starts it
