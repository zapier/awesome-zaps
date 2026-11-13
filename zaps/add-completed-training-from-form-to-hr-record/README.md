# Add completed training from form to HR record

When a training form is submitted, the completed course is written to your HR system as a training record with the completion date in DD/MM/YYYY, so nobody re-keys it.

**Apps:** Google Forms, Webhooks by Zapier

**Based on:** [Add completed training from form to HR record](https://zapier.com/automations/human-resources-hr/learning-development/course-completion-tracking/add-completed-training-from-form-to-hr-record) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-completed-training-from-form-to-hr-record

The agent follows `SKILL.md`: it asks you for your training form, its question titles and your HR system's endpoint URL, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-forms`)
- `triggers/`: what starts it
