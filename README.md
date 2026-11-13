# awesome-zaps

Zap templates you install by pasting one line into your AI agent. Written and maintained by Zapier; the repo doesn't accept zaps from outside contributors.

## Install a zap

Pick a folder in [`zaps/`](zaps) and paste this into your AI agent, with the folder name filled in:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/<zap>

The agent follows the zap's `SKILL.md`: it asks for your values, then builds, tests and turns on the Zap in your Zapier account. It builds with Zapier MCP, and walks you through connecting it if your agent isn't connected yet.

## A zap's folder

Each zap is a folder of plain files:

```
zaps/<zap>/
├── README.md        what it does and the one-line install prompt
├── SKILL.md         what the agent asks, builds and tests
├── workflow.ts      the Zap's code
├── config.ts        its settings; each "REPLACE_…" value is set per person
├── connections/     one file per account it uses
└── triggers/        what starts it
```

## Layout

| Path          | What lives here                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zaps/<zap>/` | One zap per folder                                                                                                                                |
| `scripts/`    | The catalog test, and scripts for deploying a zap and checking its status                                                                         |
| `skills/`     | Skills for working on zaps: [`create-zap-template`](skills/create-zap-template/SKILL.md) turns a zapier.com page or a running Zap into a template |
| `docs/`       | How to test and deploy a zap                                                                                                                      |

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
