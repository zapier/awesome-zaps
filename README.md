# awesome-zaps

A collection of Zaps written as code (Next Gen Zaps built on the Zapier SDK), written and maintained by Zapier. It doesn't accept zaps from outside contributors.

## Layout

| Path                     | What lives here                                               |
| ------------------------ | ------------------------------------------------------------- |
| `packages/zaps/<zap>/`   | One zap per folder: `workflow.ts`, `SKILL.md` and `README.md` |
| `packages/zaps/scripts/` | Scripts for deploying a zap and checking its status           |
| `docs/`                  | How to test and deploy a zap                                  |

## Getting started

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
