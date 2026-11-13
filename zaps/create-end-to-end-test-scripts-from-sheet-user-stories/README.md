# Create end to end test scripts from sheet user stories

When a user story in your sheet is added or changed, its test cases and an end-to-end test script are generated and saved to a review tab, so QA can pick them up.

**Apps:** Google Sheets, ChatGPT (OpenAI)

**Based on:** [Create end to end test scripts from sheet user stories](https://zapier.com/automations/engineering/quality-assurance/end-to-end-testing/create-end-to-end-test-scripts-from-sheet-user-stories) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-end-to-end-test-scripts-from-sheet-user-stories

The agent follows `SKILL.md`: it asks you for your stories spreadsheet and tab, the output tab, and which ChatGPT connection and model to use, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`chatgpt`, `google-sheets`)
- `triggers/`: what starts it
