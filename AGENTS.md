# AGENTS.md

Instructions for AI agents working on this repository.

This repo holds Zaps written as code (Zapier SDK durables). This file holds the rules for working here. Anything with an owner elsewhere is linked, not restated.

## Where to work

| Path                     | What lives here                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| `packages/zaps/<zap>/`   | One zap: `workflow.ts`, `SKILL.md`, `README.md`                     |
| `packages/zaps/scripts/` | The `zap:deploy` and `zap:status` scripts, and the zap catalog test |
| `docs/TESTING.md`        | How to test a zap against Zapier                                    |
| `docs/DEPLOY.md`         | What to expect when deploying a zap                                 |
| `eslint.config.js`       | ESLint rules                                                        |
| `.fallowrc.jsonc`        | Fallow entry points and settings                                    |
| `.github/workflows/`     | CI                                                                  |

## Commands

**Always run commands from the repo root.**

| Task                                            | Command                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| Everything below, in CI's order (the done gate) | `pnpm check`                                                                        |
| Type-check                                      | `pnpm types`                                                                        |
| Lint, failing on any warning                    | `pnpm lint`                                                                         |
| Format, or check formatting                     | `pnpm fmt`, `pnpm fmt:check`                                                        |
| Tests                                           | `pnpm test`                                                                         |
| Dead code, duplication, health score of 100     | `pnpm fallow`                                                                       |
| Preview a deploy, deploy, check status          | `pnpm zap:deploy <zap> --dry-run`, `pnpm zap:deploy <zap>`, `pnpm zap:status <zap>` |

Everything else is in the root and `packages/zaps` `package.json`. Read them there.

## Before you start

### Zapier SDK docs

**Read the SDK reference, not the version you remember.** The SDK is new and your training data does not describe it accurately. Use [the SDK reference](https://docs.zapier.com/sdk/reference.md), and install the skill with `npx skills add zapier/sdk`. Never guess a method name, app key, or action key: look it up.

### Scope

- **Change only what the task asks for.** No opportunistic renames, reformatting, dependency bumps, or refactors riding along in the same change. Spotted something worth fixing? Name it in the PR description and leave it.
- **If the task turns into a refactor or a redesign, stop and ask** before continuing.
- **Do not add a dependency, create a directory, or introduce a new pattern without asking.** A new zap's own folder is part of adding that zap.

## Requirements

### General

- **Never bypass the pre-commit hook** with `--no-verify`. Skipping it only moves the failure to CI.
- **Never commit a token, a trigger URL, or `.env`.** Code refers to connections by alias, named in the zap's `SKILL.md`.
- **Never describe how test runs work outside [docs/TESTING.md](docs/TESTING.md), or how deploys work outside [docs/DEPLOY.md](docs/DEPLOY.md).** Each owns its topic; a second description will drift from it.
- **Never start a test run or deploy a workflow without asking the user first.** Tell them which account it will touch. A run executes real side effects.

### Workflows

- **`workflow.ts` is the whole zap.** An agent deploys it as is, so it imports nothing but `@zapier/zapier-durable`, `@zapier/zapier-sdk` and `zod`. Types, lint and fallow skip zap folders, and `scripts/catalog.test.ts` checks them instead.
- **Parse the input with zod on the first line of the handler.** That schema is the contract for what the trigger delivers.
- **Wrap each side effect in its own `ctx.step`**, and end the step name with the record's primary id so a retry skips work that already succeeded. Never use an array index as the suffix.
- **Put IDs and settings in constants at the top of `workflow.ts`**, with a comment naming what each one refers to.
- **Pin exact dependency versions.** Zapier's sandbox rejects a dependency published less than 24 hours ago.

### New code

- **Everything you add has a caller in this change.** No exported helper nothing imports, no config constant nothing reads, no abstraction with one implementation. Fallow treats `packages/zaps/scripts/zap.ts` as the entry point, so a file it does not reach is reported as dead code.
- **Delete what you replaced.** If your change supersedes an implementation, remove it in the same change. Never leave both.
- **Search before you write.** The helper probably exists in another zap or in the SDK.
- **No defensive branch for a state that cannot occur here.** An empty `catch`, a null check the types already rule out, or validation for a shape no trigger sends looks careful and hides the real failure.

### No suppressions

There are no baselines and no suppression files, so nothing is grandfathered in. A new finding is a bug in your change, not something to get past a commit.

- **Never add** `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `fallow-ignore` comments.
- **Never add a fallow baseline** or lower the `--min-score` gate.
- **Never loosen a rule** in `eslint.config.js`, `tsconfig.json`, or `.fallowrc.jsonc` to make a change pass. Changing a rule is its own PR with its own justification.

### Code comments

- **Comment the constraint or the reason**, never the mechanism. If the code says what it does, the comment says why it has to.
- **Never restate the code.** `// increment the counter` above `count++` is noise.
- **Never explain the framework.** Assume the reader knows TypeScript and the Zapier SDK.
- **Never explain the current task** or the change you just made. The comment outlives the session that wrote it.
- **No `TODO` comments** for work already tracked in an issue or PR. Track it there.
- **No ticket keys or links** in code comments. They rot and the reader cannot open them.

### Documentation

- **Every zap folder gets a `SKILL.md` and a `README.md`** next to `workflow.ts`. The `SKILL.md` is what an agent follows to build the zap. The `README.md` states what the zap does in one line, then lists each file and what it holds.
- **One document owns a topic.** Before adding a file, find the one that already covers it and extend it. A second document on the same subject is a second thing to maintain, and the pair will drift.
- **Never restate another document.** Link to it. If you find yourself summarizing a file "for convenience," delete the summary and link instead.
- **Never copy a command into prose.** `pnpm` commands live in `package.json`, and a copy will drift. The exceptions are the [Commands](#commands) table above and the commands in [docs/TESTING.md](docs/TESTING.md) and [docs/DEPLOY.md](docs/DEPLOY.md), which own those topics.
- **Keep docs true to the final diff.** Before every push, re-read each README, doc comment, and status line that describes the code you touched, including text you wrote earlier in the same PR, and check it against the final diff. Describe only what the code does now. Apply the same check to the PR description.

### Testing

- **Use `vi.mock()` for mocking** in unit tests.
- **Test error paths, success paths, and validation logic.**
- **A test's name must describe exactly the inputs and assertions in its body**, no more and no less. Re-read the name whenever you change the body, its inputs, or any identifier the name mentions.
- **Mock setup must match the calls the code path really makes.** Trace the path, queue only the responses it consumes, and delete mocks nothing uses after a refactor.
- **Tests live in `packages/zaps/scripts/`.** Vitest runs only that folder.

### Pull requests

**Description:** say why the change is worth merging and anything in it that would otherwise read as arbitrary. Keep each section to tight bullets. Do not restate what CI already runs, and do not attribute motivation to a named person. If a test run on Zapier is part of the verification, say which input you ran and what you saw, because CI cannot show that.

Before requesting review:

- **Check the CI run for the latest commit.** A green run on an earlier commit is not a green run.
- **Re-read the description against the final diff.**

## Verifying your work

### Definition of done

A change is done when **both** of these pass:

- `pnpm check` exits zero. That is types, lint, format, tests, and fallow at 100, the same jobs CI runs on every pull request.
- **The pre-commit hook succeeds on your commit.** It runs Prettier on staged files, then ESLint, the type check, and fallow.

Run them. **Never report work as complete on the basis of a command you did not run.** If you could not run something, say which and why rather than implying you did.

A test run on Zapier is not in the gate. It needs a human sign-in and executes real side effects.

### When a check fails

1. Fix it and re-run the check.
2. Second failure on the same thing: stop guessing. State a new hypothesis before the next attempt.
3. Third failure: stop, revert, and report the failing output in full.

**Never route around a failing check.** No `--no-verify`, no suppression comment, no baseline, no disabled rule, no deleted or weakened assertion.

Common causes:

- **Wrong `node` or `pnpm`:** compare `node -v` and `pnpm -v` with `.tool-versions`. If asdf's shims are not first on your `PATH`, other installs win.
- **Fallow below 100:** `pnpm exec fallow health` lists the findings. `pnpm exec fallow dead-code` and `pnpm exec fallow dupes` list the others.
- **ESLint says a file "was not found by the project service":** the file sits outside every package's `tsconfig.json`. Move it into a package that includes it, or ignore the directory if tooling generates it.

## Where everything else lives

| Document                           | What it covers                                |
| ---------------------------------- | --------------------------------------------- |
| [README.md](README.md)             | What the repo is, layout, and getting started |
| [CONTRIBUTING.md](CONTRIBUTING.md) | The quality bar, sign-off, and adding a zap   |
| [docs/TESTING.md](docs/TESTING.md) | Testing a zap against Zapier                  |
| [docs/DEPLOY.md](docs/DEPLOY.md)   | Deploy expectations                           |
