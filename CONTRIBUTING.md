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

1. Add a folder under `packages/zaps/` named `<source>-<item>-to-<destination>-<item>` in kebab-case, such as `form-submission-to-spreadsheet-row`. The `defineDurable` name is the workflow's name on Zapier, and stays the same once the workflow is deployed.
2. Add `workflow.ts` (SDK wiring only), `logic.ts` (tested logic), `config.ts` (constants), `logic.test.ts`, `deploy.json`, and a `README.md` that describes the zap, its author, and each file.
3. Keep decisions in `logic.ts` so they are covered by tests, and keep `workflow.ts` to calling the SDK and passing results along.
4. If it is the first zap, add `@zapier/zapier-durable` and `@zapier/zapier-sdk` to `packages/zaps/package.json` with exact versions. Fallow reports them as unused until a zap imports them.
5. Run `pnpm check`.
6. If the zap has side effects, test it as described in [docs/TESTING.md](./docs/TESTING.md).

`packages/zaps/*/workflow.ts` files are fallow entry points because the SDK CLI deploys them and nothing imports them.
