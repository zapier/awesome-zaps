---
name: create-release-trigger-from-merged-pull-request-commits
description: Build a Zapier Next Gen Zap that watches a GitHub repository and, for each commit that comes from a merged pull request, posts the commit URL, message, author and repository to a sub-zap webhook. Use when a team wants a post-merge handoff (release notes, deploy, triage) started automatically from merged PRs.
license: MIT
metadata:
  author: zapier
  summary: "When a pull request is merged, its commit is passed to your sub-zap with the commit link, message, author and repository, so release steps start without anyone copying details."
  apps: "GitHub, Webhooks by Zapier"
  category: "Engineering"
  job: "Software delivery"
  source: "https://zapier.com/automations/engineering/software-delivery/release-management/create-release-trigger-from-merged-pull-request-commits"
---

# Create release trigger from merged pull request commits

## What it does

1. **Trigger:** a new commit lands on the configured GitHub repository (GitHub, New Commit).
2. **Filter:** the commit message must start with `Merge pull request #<number>`. Other commits end the run with `skipped`.
3. **Repository:** the `owner/repo` is read from the commit's HTML URL.
4. **Sub-zap:** a JSON POST goes to your sub-zap webhook with `url`, `message`, `author` and `repo`.

## Build it

**Check the fields first:** with the user's own connections, inspect each action's input fields (`inspect_zapier_actions`) and make sure every key and value in `workflow.ts` matches before the first test run.

**How to build:** with Zapier MCP, load the `zapier:build-workflows` skill (`list_zapier_skills`, then `get_zapier_skill`) and follow it to create, test and publish the workflow. This file says _what_ to build; that skill says _how_, and has the current tool names.

**Source:** the files in this folder are the whole zap. `workflow.ts` is the workflow. It imports its settings from `config.ts` and each account from `connections/<alias>.ts`, and `triggers/` holds what starts it.

- **With the zap CLI:** `npx zap-pack add awesome-zaps/create-release-trigger-from-merged-pull-request-commits` (it makes a zap project if you aren't in one), then `npx zap-pack deploy create-release-trigger-from-merged-pull-request-commits` from that project. Deploy asks for each open setting and account, and sets the trigger.
- **With Zapier MCP:** publish every `.ts` file outside `triggers/` as `sourceFiles`, with three changes: write `config.ts` as plain values (`export const NAME = "value";`), write each `connections/<alias>.ts` as `export default "<alias>";`, and write each `@/name` import as a relative path ending in `.ts` (`./config.ts`, `./connections/<alias>.ts`). Set the trigger from the file in `triggers/`.

1. **Trigger:** GitHub, New Commit (`github`, action `commit`). Set its `repo` field to `GITHUB_REPO`. This is a trigger, so it needs a GitHub connection.
2. **Connections:**
   - `github`: the user's GitHub connection, for the account that can read the repository.
   - Webhooks by Zapier (`webhook`) needs no connection.
3. **Constants:**
   - `GITHUB_REPO`: the repository to watch, as `owner/repo`.
   - `SUB_ZAP_URL`: the webhook URL of the sub-zap that receives merged commits.
   - `MERGE_PATTERN`: the commit message pattern for merged pull requests. The default is GitHub's standard merge message.
4. Test with the steps below, then publish, wait until the trigger is active, and give the user their webhook details.

## Ask the user

- Which GitHub repository should be watched, as `owner/repo`?
- What is the sub-zap's webhook URL? It must accept JSON with `url`, `message`, `author` and `repo`.
- Does the team squash or rebase merge pull requests? If so, the merge-message filter will not match and the pattern needs changing.

## Test

Run this sample as a draft test run before publishing. It is a non-merge commit, so it should skip without calling anything:

```json
{
  "html_url": "https://github.com/acme/widgets/commit/abc123",
  "message": "Fix typo in README",
  "author_login": "octocat"
}
```

Confirm the output is `{ "skipped": true, "reason": "not-a-merged-pull-request" }`. Then run a merged-PR sample, such as a commit message `Merge pull request #42 from acme/fix-typo`, with a sub-zap URL you control. Check that the sub-zap receives `url`, `message`, `author` and `repo`.

## Customize

- **Route to different sub-zaps by repository** for multi-repo teams.
- **Include the PR number or branch name** in the payload for richer downstream actions.

## Notes

- The sub-zap is a plain webhook POST, not a Sub-Zap step, so the receiving end must accept JSON.
- A merged pull request whose commit message was edited may not match the pattern.
- Anyone with the sub-zap URL can post to it. Keep it out of shared documents.
