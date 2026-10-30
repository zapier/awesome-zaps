# Deploying zaps

Deploys go through `pnpm zap:deploy <zap-folder>`, which publishes the zap's source to the workflows listed in its `deploy.json` using the Zapier SDK CLI. It runs the CLI with `pnpm dlx`, so there is nothing to install. `pnpm zap:status <zap-folder>` shows whether those workflows are healthy.

CI does not deploy. A person deploys by hand, and an agent never deploys without asking the user first and saying which workflow and account the deploy will touch.

## deploy.json

Each zap folder has a `deploy.json` that declares its deployment, so changes to it are reviewed like code:

- `files`: the source files to publish. Tests are not included.
- `connections`: each connection alias the code uses, mapped to the Zapier connection ID it is bound to. Connection IDs identify a connection and are not credentials, but they belong to the account that created them, so a contributed zap should leave them for the deployer to fill in.
- `workflows`: each workflow's ID and its trigger (the app, the action, the settings, and which connection authenticates it). A workflow with no trigger is published as on-demand.

A trigger's settings come from the workflow as it was created. To add a workflow, create it with `create-workflow` in the Zapier SDK CLI, add its ID and trigger to `deploy.json`, and deploy.

Workflow URLs that embed a token, such as a trigger URL, are never committed.

## Before you deploy

`pnpm zap:deploy` checks the first four itself. The rest are on you.

1. **You are on `main`, with a clean tree, up to date with origin.** Deploy only from `main`, so the deployed source always matches a reviewed commit.
2. **You can manage the workflow.** Only its creator can.
3. **No drafts are open** on the workflow in the Zapier editor.
4. **The plan looks right.** Run `pnpm zap:deploy <zap-folder> --dry-run` first. It changes nothing, and prints each workflow's source changes, whether you can manage it, and any drift between what is live and `deploy.json`. A source change your PR does not explain means someone edited the workflow elsewhere. Find out why before you overwrite it.
5. **`pnpm check` passes and a test run passed.** See [TESTING.md](./TESTING.md).

## Deploy

```bash
pnpm zap:deploy <zap-folder> --dry-run   # plan only
pnpm zap:deploy <zap-folder>             # asks before publishing each workflow
```

For each workflow the script publishes a new version with the pinned dependencies and the connections and trigger from `deploy.json`, then checks that the workflow is enabled, its trigger is active with no error, and the new version is current. Publishing succeeds even when a trigger fails to attach, which is why the script checks. It exits with an error if any check fails.

## Checking status

```bash
pnpm zap:status <zap-folder>
```

This prints each workflow's enabled state, its trigger status and any error, its current version, and its five most recent runs.

## Rolling back

Check out the earlier commit from `main`'s history that has the source you want, and deploy it. Old versions stay in the workflow's history, so nothing is lost.
