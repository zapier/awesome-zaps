# awesome-zaps

A collection of Zaps written as code (Next Gen Zaps built on the Zapier SDK), open to contributions.

## Layout

| Path                     | What lives here                                             |
| ------------------------ | ----------------------------------------------------------- |
| `packages/zaps/<zap>/`   | One zap per folder, with its source, tests, and `README.md` |
| `packages/zaps/scripts/` | Scripts for deploying a zap and checking its status         |
| `docs/`                  | How to test and deploy a zap                                |

## Getting started

```bash
asdf install
pnpm install
pnpm check
```

`pnpm check` runs the same checks as CI. See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Copyright (c) Zapier, Inc. All rights reserved. This repository has no open source license yet, so its contents may not be copied, modified or redistributed without permission.
