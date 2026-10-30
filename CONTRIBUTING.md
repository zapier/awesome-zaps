# Contributing

## Commands

The command table lives in [AGENTS.md](./AGENTS.md#commands), along with the rules for working here. Run `pnpm check` before you push.

## Quality bar

CI and the pre-commit hook fail on any type error, lint warning, formatting difference, failing test, dead code, duplication, or a fallow health score below 100. There are no baselines, so nothing is grandfathered in: fix the finding rather than suppressing it.

## Sign-off and ownership

Every commit needs a `Signed-off-by` line (`git commit -s`), which certifies the [Developer Certificate of Origin](https://developercertificate.org/). Keep your attribution in the zap's `README.md`.

Do not submit anything that contains a secret, a token, a customer's data, or code you do not have the right to share.

## Structure

This is a pnpm workspace. Packages live in `packages/*`, and each complex zap in `packages/zaps/*` is a package too. Each one defines `types` and `test` scripts so the root commands can run them. A new package in `packages/*` must also be added to the `references` list in the root `tsconfig.json`. A complex zap does not need to be, because its own `types` script checks it.

## Adding a zap

Add a folder under `packages/zaps/` named after the zap in kebab-case. The folder name is also the `defineDurable` name, which is the workflow's name on Zapier and stays the same once the workflow is deployed.

### A simple zap

One self-contained file an agent deploys as is, the shape zapier.sh lists and `npx skills add` installs:

1. Add `workflow.ts`, `SKILL.md` (frontmatter `name` matching the folder, plus `metadata.summary` and `metadata.apps`) and a `README.md`.
2. Name apps by slug (`google-sheets`, `slack`), never by implementation key, and name every connection alias in `SKILL.md`.
3. Run `pnpm check`. With no `package.json`, the folder is skipped by types, lint and fallow, and `scripts/catalog.test.ts` checks it instead.

### A complex zap

A `package.json` makes the folder a workspace package, which opts it into types, lint and tests. Step 3 opts it into fallow.

1. Add `workflow.ts` (SDK wiring only), `logic.ts` (tested logic), `config.ts` (constants), `logic.test.ts`, `deploy.json` (see [docs/DEPLOY.md](./docs/DEPLOY.md)), and a `README.md` that describes the zap, its author, and each file.
2. Add a `package.json` modelled on `packages/zaps/package.json`: `name` set to the folder name, `private`, `"type": "module"`, and `types` and `test` scripts. Its `dependencies` are exactly the packages the deployed files import (`@zapier/zapier-durable`, `zod`, and `@zapier/zapier-sdk` if used), at exact versions.
3. Add a `tsconfig.json` that extends `../../../tsconfig.json` and sets `include` to `["*.ts"]`. Without `include`, the root's empty `files` list leaves nothing to type-check.
4. Add `"!packages/zaps/<zap>/workflow.ts"` to `ignorePatterns` in `.fallowrc.jsonc`, so fallow checks the zap. `scripts/catalog.test.ts` fails without it.
5. Keep decisions in `logic.ts` so they are covered by tests, and keep `workflow.ts` to calling the SDK and passing results along.
6. Reinstall so the lockfile picks up the new package, run the done gate from [AGENTS.md](./AGENTS.md#commands), and commit the updated `pnpm-lock.yaml`.
7. If the zap has side effects, test it as described in [docs/TESTING.md](./docs/TESTING.md).

A complex zap's `workflow.ts` is a fallow entry point because the SDK CLI deploys it and nothing imports it.
