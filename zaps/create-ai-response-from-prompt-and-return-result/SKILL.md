---
name: create-ai-response-from-prompt-and-return-result
description: Build a Zap on Zapier that another workflow can call as a sub-zap, sending it a prompt and optional instructions, waiting for ChatGPT to finish, and returning the generated text. Use when a Zap or workflow needs a model response from a prompt and should get back the finished text, not a half-done request.
license: MIT
metadata:
  author: zapier
  summary: "Send a prompt to ChatGPT from another Zap and get the finished answer back, checked every five minutes until it is ready."
  apps: "Sub-Zap by Zapier, ChatGPT (OpenAI)"
  category: "Personal Productivity"
  job: "AI assisted productivity"
  source: "https://zapier.com/automations/personal-productivity/ai-assisted-productivity/ai-writing-assistance/create-ai-response-from-prompt-and-return-result"
---

# Create AI response from prompt and return result

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-ai-response-from-prompt-and-return-result. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a calling Zap or workflow starts this sub-zap in Sub-Zap by Zapier (`sub-zap-by-zapier`, `start_subzap`) with a `prompt`, optional `instructions`, and an optional `model`. The sub-zap returns its output to the caller.
2. **Sanitize:** control characters are removed from the prompt and instructions, and the model defaults to `gpt-4o` when the caller sends none. An empty prompt returns right away without calling ChatGPT.
3. **ChatGPT** (`chatgpt`) submits the prompt as a Responses API request and keeps the response ID.
4. **Wait and check:** the workflow waits five minutes, then fetches the stored response from ChatGPT. It repeats until the response has text or the check limit is reached.
5. **Return:** the generated text goes back to the caller as `{ ok: true, text, responseId }`. If there is no text after the last check, it returns `{ ok: false, error }` instead.

## Ask the user

This zap has no per-person values, so nothing is filled in before deploying. Ask the user these:

- **Which ChatGPT (OpenAI) connection** the sub-zap should use. It must be connected before the workflow can run.
- **Whether to keep the defaults**, which are worth reviewing with them:
  - `DEFAULT_MODEL` in `config.ts`: the model used when the caller sends none. Defaults to `gpt-4o`.
  - `POLL_INTERVAL_SECONDS` and `MAX_POLLS` at the top of `workflow.ts`: the wait before each check (300 seconds, five minutes) and how many checks to make (12, so one hour) before returning an error.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `chatgpt` to the user's ChatGPT (OpenAI) connection, which the workflow uses to submit the prompt and fetch the response. Sub-Zap by Zapier needs no connection, so bind `sub-zap-by-zapier` to none.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/start-subzap.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing:

```json
{
  "prompt": "Write a two-sentence thank-you note to a customer who renewed their plan.",
  "instructions": "Keep a warm, plain tone. No emojis.",
  "model": "gpt-4o"
}
```

Check that the run first submits the request, then waits, then fetches the response. The returned object should be `{ ok: true, text, responseId }` with a non-empty `text`, and `responseId` should match the response ID shown in the run's submit step. Also run it with an empty `prompt` and confirm it returns `{ ok: false, error: "empty-prompt" }` without calling ChatGPT.

If run-status tools aren't available, check the result in ChatGPT directly. Ask the user to delete any test responses there; the agent does not delete them.

## Notes

- Each check is one journaled step, so a retry resumes where it stopped instead of submitting the prompt again.
- The wait between checks uses the workflow's own timer, so no step holds a connection open while it waits.
- The model and the wait can be changed at the top of `workflow.ts` and in `config.ts` without touching the rest of the flow.
- Once the trigger is active, give the user its trigger details so they can call it from their own Zap or workflow.
- To route the final text to a review channel before it returns, add a Slack or email step between the last check and the return. To label tone or safety first, add a classification step before the return.
