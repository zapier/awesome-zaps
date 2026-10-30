---
name: create-ai-response-from-prompt-and-return-result
description: Build a Zapier Next Gen Zap that another workflow can call as a sub-zap, sending it a prompt and optional instructions, waiting for ChatGPT to finish, and returning the generated text. Use when a Zap or workflow needs a model response from a prompt and should get back the finished text, not a half-done request.
metadata:
  author: zapier
  summary: "Send a prompt to ChatGPT from another Zap and get the finished answer back, checked every five minutes until it is ready."
  apps: "Sub-Zap by Zapier, ChatGPT (OpenAI)"
  category: "Personal Productivity"
  job: "AI assisted productivity"
  source: "https://zapier.com/automations/personal-productivity/ai-assisted-productivity/ai-writing-assistance/create-ai-response-from-prompt-and-return-result"
---

# Create AI response from prompt and return result

## What it does

1. **Trigger:** a calling Zap or workflow invokes this sub-zap with a `prompt`, optional `instructions`, and an optional `model`. The sub-zap returns its output to the caller.
2. **Sanitize:** control characters are removed from the prompt and instructions, and the model defaults to `gpt-4o` when the caller sends none.
3. **ChatGPT (OpenAI)** submits the prompt as a Responses API request and keeps the response ID.
4. **Wait and check:** the workflow waits five minutes, then fetches the stored response from ChatGPT. It repeats until the response has text or the check limit is reached.
5. **Return:** the generated text goes back to the caller as `{ ok: true, text, responseId }`. If there is no text after the last check, or the input prompt is empty, it returns `{ ok: false, error }` instead.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** `workflow.ts` in this folder is the whole workflow. Deploy it as one source file. Change only the constants listed below; everything else stays as written.

1. **Trigger:** Sub-Zap by Zapier, Start a Sub-Zap (`sub-zap-by-zapier`, `start_subzap`). It needs no connection, so its `authentication_id` is `null`. Its input list is `prompt`, `instructions`, `model`.
2. **Connections** (each alias in the code is the app's slug):
   - `chatgpt`: the user's ChatGPT (OpenAI) connection.
3. **Constants:**
   - `DEFAULT_MODEL`: the model used when the caller sends none. Defaults to `"gpt-4o"`.
   - `POLL_INTERVAL_SECONDS`: the wait before each check. Defaults to `300` (five minutes).
   - `MAX_POLLS`: how many checks to make before returning an error. Defaults to `12`.
4. The caller must send `prompt`. Once the trigger is active, give the user the workflow's trigger details so they can call it from their own Zap or workflow.

## Ask the user

- Which ChatGPT (OpenAI) connection should the sub-zap use? The account needs to be connected before the workflow can run.
- Which model should be the default when the caller does not send one? The template uses `gpt-4o`.
- How long should the sub-zap keep checking? The template waits five minutes between checks and gives up after twelve.

## Test

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing:

```json
{
  "prompt": "Write a two-sentence thank-you note to a customer who renewed their plan.",
  "instructions": "Keep a warm, plain tone. No emojis.",
  "model": "gpt-4o"
}
```

Check that the run first submits the request, then waits, then fetches the response. The returned object should be `{ ok: true, text, responseId }` with a non-empty `text`, and `responseId` should match the response ID shown in the run's submit step. Also run it with an empty `prompt` and confirm it returns `{ ok: false, error: "empty-prompt" }` without calling ChatGPT.

## Customize

- **Route the final content to a review channel** before returning it to the caller: add a Slack or email step between the last check and the return.
- **Add a content-classification step** that labels tone or safety before the return.

## Notes

- Each check is one journaled step, so a retry resumes where it stopped instead of submitting the prompt again.
- The wait between checks uses the workflow's own timer, so no step holds a connection open while it waits.
- The model and the wait can be changed at the top of `workflow.ts` without touching the rest of the flow.
