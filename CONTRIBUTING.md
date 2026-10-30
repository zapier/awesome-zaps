# Contributing

## Commands

The command table lives in [AGENTS.md](./AGENTS.md#commands), along with the rules for working here. Run `pnpm check` before you push.

## Quality bar

CI and the pre-commit hook fail on any type error, lint warning, formatting difference, failing test, dead code, duplication, or a fallow health score below 100. There are no baselines, so nothing is grandfathered in: fix the finding rather than suppressing it.

## Sign-off and ownership

Every commit needs a `Signed-off-by` line (`git commit -s`), which certifies the [Developer Certificate of Origin](https://developercertificate.org/). Keep your attribution in the zap's `README.md`.

Do not submit anything that contains a secret, a token, a customer's data, or code you do not have the right to share.

## Structure

This is a pnpm workspace. Packages live in `packages/*`, and each one defines `types` and `test` scripts so the root commands can run them. A new package must also be added to the `references` list in the root `tsconfig.json`.

## Adding a zap

A zap is one self-contained `workflow.ts` that an agent deploys as is, next to the `SKILL.md` that zapier.sh lists and `npx skills add` installs.

1. Add a folder under `packages/zaps/` named after the zap in kebab-case. The folder name is also the `defineDurable` name, which is the workflow's name on Zapier and stays the same once the workflow is deployed.
2. Add `workflow.ts`, `SKILL.md` (frontmatter `name` matching the folder, plus `metadata.summary` and `metadata.apps`) and a `README.md`.
3. Name apps by slug (`google-sheets`, `slack`), never by implementation key, and name every connection alias in `SKILL.md`.
4. Run `pnpm check`. `scripts/catalog.test.ts` checks the zap folder.
5. If the zap has side effects, test it as described in [docs/TESTING.md](./docs/TESTING.md).
