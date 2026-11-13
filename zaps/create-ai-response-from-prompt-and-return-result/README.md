# Create AI response from prompt and return result

Send a prompt to ChatGPT from another Zap, wait for it to finish, and get the answer back.

**Apps:** Sub-Zap by Zapier, ChatGPT (OpenAI)

**Based on:** [Create AI response from prompt and return result](https://zapier.com/automations/personal-productivity/ai-assisted-productivity/ai-writing-assistance/create-ai-response-from-prompt-and-return-result) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-ai-response-from-prompt-and-return-result

The agent follows `SKILL.md`: it asks you which ChatGPT (OpenAI) connection to use and whether to change the default model or the wait between checks, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the default model
- `connections/`: the accounts it uses (`chatgpt`, `sub-zap-by-zapier`)
- `triggers/`: what starts it
