# Create invoice and ASN records from incoming cXML

When a supplier sends a cXML invoice or ship notice, the raw file is saved to Drive and a matching row is logged in your invoice table, with ASN paperwork generated.

**Apps:** Webhooks by Zapier, Google Drive, Zapier Tables, Xero, pdfFiller

**Based on:** [Create invoice and ASN records from incoming cXML](https://zapier.com/automations/finance/accounts-payable/invoice-processing-management/create-invoice-and-asn-records-from-incoming-c-xml) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-invoice-and-asn-records-from-incoming-c-xml

The agent follows `SKILL.md`: it asks you for the Drive folder for raw files, the invoice table, the Xero organization and the ASN template, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-drive`, `pdffiller`, `xero`, `zapier-tables`)
- `triggers/`: what starts it
