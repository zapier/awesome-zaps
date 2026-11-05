# Contributing

## Commands

The command table lives in [AGENTS.md](./AGENTS.md#commands), along with the rules for working here. Run `pnpm check` before you push.

## Quality bar

CI and the pre-commit hook fail on any type error, lint warning, formatting difference, failing test, dead code, duplication, or a fallow health score below 100. There are no baselines, so nothing is grandfathered in: fix the finding rather than suppressing it.

## Who contributes

Zapier writes and maintains every zap here, and the repo doesn't accept zaps or pull requests from outside contributors.

Before each push, review the change for secrets, tokens, customers' data and other personal data, and for code copied from elsewhere under a license that conflicts with MIT. Agents write most of the zaps, so this review is the check that what ships is ours to share.

## Structure

This is a pnpm workspace. Packages live in `packages/*`, and each one defines `types` and `test` scripts so the root commands can run them. A new package must also be added to the `references` list in the root `tsconfig.json`.

## Adding a zap

A zap is one self-contained `workflow.ts` that an agent deploys as is, next to the `SKILL.md` that zapier.sh lists and `npx skills add` installs.

1. Add a folder under `packages/zaps/` named after the zap in kebab-case. The folder name is also the `defineDurable` name, which is the workflow's name on Zapier and stays the same once the workflow is deployed.
2. Add `workflow.ts`, `SKILL.md` (frontmatter `name` matching the folder, `license: MIT`, plus `metadata.summary` and `metadata.apps`) and a `README.md`.
3. Name apps by slug (`google-sheets`, `slack`), never by implementation key, and name every connection alias in `SKILL.md`.
4. Run `pnpm check`. `scripts/catalog.test.ts` checks the zap folder.
5. If the zap has side effects, test it as described in [docs/TESTING.md](./docs/TESTING.md).
