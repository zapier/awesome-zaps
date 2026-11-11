# Testing zaps

CI checks each zap folder with `scripts/catalog.test.ts`. A test run executes the whole zap on Zapier against real connections, and that is the only way to see its side effects. Test runs are manual.

## Test targets

A test run executes real side effects that cannot be taken back, so it must never touch production data. A zap that writes anywhere (a chat channel, a spreadsheet, a ticket) must:

- Point at a test target (a test channel, a copy of the sheet) through its settings, passed on the deploy command line (`--set NAME=value`), never written into `config.ts`.
- Follow the test its `SKILL.md` describes, and name anything the run creates "[install-test] …".

## Run a zap

Test runs go through the [zap-pack](https://www.npmjs.com/package/zap-pack) CLI, right here: the repo root is a zap-pack project, with zap-pack in its dev dependencies. It deploys the zap's folder as a workflow in your Zapier account, so you can run it, read its logs, and turn it off.

1. Install, run the full checks, and sign in:

   ```bash
   pnpm install
   pnpm check
   npx zap-pack login
   ```

2. Find the connection IDs the zap needs. Each zap's `SKILL.md` names its connection aliases, and `npx zap-pack info` lists them too.

3. Deploy it with the test connections and test settings on the command line. They're saved in the repo's gitignored `.zap.json`, never in the zap's files, so they're never committed. Deploying turns the trigger on, so point it at test resources only.

   ```bash
   npx zap-pack deploy <zap-name> --yes \
     --connection <alias>=<connection id> \
     --set <SETTING>=<test value> \
     --answer <trigger field>=<value>
   ```

   `--yes` stops with the flag that supplies whatever is still missing.

4. Run it with `test: true` in the input, then read what happened:

   ```bash
   npx zap-pack run <zap-name> --input '{"test":true}'
   npx zap-pack logs <zap-name>
   ```

5. Check the result at the test target, and confirm nothing changed in production. Then turn it off:

   ```bash
   npx zap-pack disable <zap-name>
   ```

6. Clean up: delete the test workflow once you're done with it. You can also delete it in the Zapier editor.

   ```bash
   npx zap-pack remove <zap-name> --force
   ```

## Before asking for review

- Say in the PR which test input you ran and what you saw. CI cannot show that.
- Check that no connection IDs, tokens, or personal paths ended up in the diff.
