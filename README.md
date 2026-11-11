# awesome-zaps

A collection of Zaps written as code (Next Gen Zaps built on the Zapier SDK), written and maintained by Zapier. It doesn't accept zaps from outside contributors.

## Layout

| Path                     | What lives here                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `packages/zaps/<zap>/`   | One zap per folder, in the [zap-pack](https://www.npmjs.com/package/zap-pack) layout |
| `packages/zaps/scripts/` | Scripts for deploying a zap and checking its status                                  |
| `docs/`                  | How to test and deploy a zap                                                         |

## A zap's folder

Each zap is a folder of plain files that the [zap-pack](https://www.npmjs.com/package/zap-pack) CLI deploys as is:

```
packages/zaps/<zap>/
├── workflow.ts      the workflow; imports its settings and accounts
├── config.ts        its settings: ask("…") for values each person sets
├── connections/     one file per account it uses
├── triggers/        what starts it
├── SKILL.md         what an agent builds, asks and tests; zapier.sh lists it
└── README.md
```

## Install a zap

From your terminal, with the zap CLI. It makes a zap project if you aren't in one, then deploys to your Zapier account:

```bash
npx zap-pack add awesome-zaps/<zap>
npx zap-pack deploy <zap>
```

Or paste a zap's prompt from [zapier.sh](https://zapier.sh) into any agent with Zapier MCP. Its `SKILL.md` says how to publish the folder that way.

## Working on this repo

```bash
asdf install
pnpm install
pnpm check
```

`pnpm check` runs the same checks as CI. See [CONTRIBUTING.md](CONTRIBUTING.md) before adding a zap.

## Trademarks

Product and company names used in these Zaps are trademarks of their respective owners and are used only to identify the service each Zap integrates with. These Zaps are not affiliated with, endorsed by, or sponsored by those companies.

## License

The code and SKILL.md files in this repository are licensed under the MIT License (see [LICENSE](LICENSE)). The MIT License covers those files only. Using the Zapier service and APIs to run these zaps is governed separately by the [Zapier Terms of Service](https://zapier.com/legal/terms-of-service) or your other agreement with Zapier for use of the Zapier service, which apply regardless of the code license.
