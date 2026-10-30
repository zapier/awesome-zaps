# Testing zaps

A zap is tested in two layers. Unit tests cover the decisions in `logic.ts` and run in CI. A test run executes the whole zap on Zapier against real connections, and that is the only way to see its side effects. Test runs are manual.

## Test targets

A test run executes real side effects that cannot be taken back, so it must never touch production data. A zap that writes anywhere (a chat channel, a spreadsheet, a ticket) must:

- Define a test target in `config.ts`, with a comment naming it.
- Use that target instead of the real one when its input has `test: true`. Put that choice in `logic.ts` and cover it with a unit test.

## Run a zap

1. Define a `zapier-sdk` function that runs the CLI without a global install, then sign in. Keep the function in your shell profile so every command below works as written:

   ```bash
   zapier-sdk() { pnpm --silent dlx @zapier/zapier-sdk-cli "$@"; }
   zapier-sdk login
   zapier-sdk get-profile
   ```

2. Run the unit tests and the full checks:

   ```bash
   pnpm check
   ```

3. Find the connection IDs the zap needs. Each zap's `config.ts` lists its connection aliases:

   ```bash
   zapier-sdk list-connections <app> --owner me --json
   ```

4. Bundle the zap's source files. Include every file `workflow.ts` imports, and leave out the tests:

   ```bash
   cd packages/zaps/<zap-name>
   SOURCE_FILES=$(jq -n \
     --rawfile workflow workflow.ts \
     --rawfile logic logic.ts \
     --rawfile config config.ts \
     '{"workflow.ts": $workflow, "logic.ts": $logic, "config.ts": $config}')
   ```

5. Start the run with `test: true` in the input. Use the exact versions pinned in `packages/zaps/package.json`. The sandbox rejects any dependency published less than 24 hours ago.

   ```bash
   zapier-sdk --stability experimental run-durable "$SOURCE_FILES" \
     --dependencies '{"zod":"<version>"}' \
     --zapier-durable-version '<version>' \
     --connections '{"<alias>":{"connectionId":"<id>"}}' \
     --input '{"test":true}' \
     --private \
     --json
   ```

   Add `@zapier/zapier-sdk` to `--dependencies` if the zap imports it. Omit `--connections` for a zap that uses none.

6. The command returns a run ID straight away. Poll it until the status is `finished`:

   ```bash
   zapier-sdk --stability experimental get-durable-run <run-id> --json
   ```

7. Check the result at the test target, and confirm nothing changed in production.

## Before asking for review

- Say in the PR which test input you ran and what you saw. CI cannot show that.
- Check that no connection IDs, tokens, or personal paths ended up in the diff.
