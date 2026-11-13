---
name: create-release-trigger-from-merged-pull-request-commits
description: Build a Zap on Zapier that watches a GitHub repository and, for each commit that comes from a merged pull request, posts the commit URL, message, author and repository to a sub-zap webhook. Use when a team wants a post-merge handoff (release notes, deploy, triage) started automatically from merged PRs.
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

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-release-trigger-from-merged-pull-request-commits. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new commit lands on the watched GitHub repository (`github`, `commit`).
2. **Filter:** the commit message must start with `Merge pull request #<number>`. Other commits end the run as `skipped`.
3. **Repository:** the `owner/repo` is read from the commit's HTML URL.
4. **Sub-zap:** a JSON POST goes to your sub-zap webhook with `url`, `message`, `author` and `repo`.

The Zap only reads commits and posts them to the sub-zap; it never writes to GitHub.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve the repository to its `owner/repo` with the user's GitHub connection; don't ask them to paste an ID you can look up.

| Setting               | Where                                                        | What goes there                                                                            |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `REPLACE_GITHUB_REPO` | `config.ts` (`GITHUB_REPO`) and `triggers/commit.ts`, `repo` | The repository to watch, as `owner/repo`. Both places get the same answer.                 |
| `REPLACE_SUB_ZAP_URL` | `config.ts` (`SUB_ZAP_URL`)                                  | The sub-zap's webhook URL. It must accept JSON with `url`, `message`, `author` and `repo`. |

Also review the default with them: `MERGE_PATTERN` in `workflow.ts` matches GitHub's standard merge message. Ask whether the team squashes or rebases pull requests; if so, that message won't match and the pattern needs changing.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `github` (the trigger's connection, in `triggers/commit.ts`) to the user's GitHub connection for the account that can read the repository. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/commit.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. It is a non-merge commit, so it should skip without calling anything:

```json
{
  "html_url": "https://github.com/acme/widgets/commit/abc123",
  "message": "Fix typo in README",
  "author_login": "octocat"
}
```

Confirm the output is `{ "skipped": true, "reason": "not-a-merged-pull-request" }`. Then run a merged-PR sample, such as a commit message `Merge pull request #42 from acme/fix-typo`, with a sub-zap URL you control. Check that the sub-zap receives `url`, `message`, `author` and `repo`. If run-status tools aren't available, check the sub-zap's run history directly. Ask the user to delete any test runs in the sub-zap; the agent doesn't delete test data. Then publish, confirm the trigger is active, and give the user their webhook details.

## Notes

- The sub-zap is a plain webhook POST, not a Sub-Zap step, so the receiving end must accept JSON.
- A merged pull request whose commit message was edited may not match the pattern.
- Anyone with the sub-zap URL can post to it. Keep it out of shared documents.
- To route to different sub-zaps by repository, or to add the PR number or branch name to the payload, change `workflow.ts`.
