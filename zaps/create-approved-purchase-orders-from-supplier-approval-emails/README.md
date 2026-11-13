# Create approved purchase orders from supplier approval emails

When a supplier or approver replies to a PO alert, the matching purchase order is created in QuickBooks Online and the thread gets a confirmation, so approved POs don't wait for someone to re-key them.

**Apps:** Microsoft Outlook, AI by Zapier, Zapier Tables, QuickBooks Online

**Based on:** [Create approved purchase orders from supplier approval emails](https://zapier.com/automations/finance/procure-to-pay/purchase-order-management/create-approved-purchase-orders-from-supplier-approval-emails) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-approved-purchase-orders-from-supplier-approval-emails

The agent follows `SKILL.md`: it asks you for your PO register table and its columns, the Outlook search that matches PO alert emails, the QuickBooks item for PO lines and the procurement mailbox, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`microsoft-outlook`, `ai`, `zapier-tables`, `quickbooks`)
- `triggers/`: what starts it
