import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { PRODUCT_COLUMN, BRANCH_COLUMN, STOCK_COLUMN } from "./config.ts";

const sdk = createZapierSdk();

// Per branch: the team leader email addresses to alert, and the stock count below which to alert.
// Add one entry per branch, keyed by the identifier that appears in BRANCH_COLUMN.
const BRANCH_LEADERS: Record<string, { emails: string[]; threshold: number }> =
  {
    YOUR_BRANCH_ID: { emails: ["YOUR_TEAM_LEADER_EMAIL"], threshold: 5 },
  };

const InputSchema = z
  .object({
    [PRODUCT_COLUMN]: z.string().nullable().optional(),
    [BRANCH_COLUMN]: z.string().nullable().optional(),
    [STOCK_COLUMN]: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "send-low-stock-email-alerts-to-team-leaders",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const branch = (input[BRANCH_COLUMN] ?? "").trim();
    const product = (input[PRODUCT_COLUMN] ?? "").trim() || "(unnamed product)";
    const stockText = (input[STOCK_COLUMN] ?? "").trim();
    const stock = Number(stockText);

    const settings = BRANCH_LEADERS[branch];
    if (!settings) {
      return { skipped: true, reason: "unknown-branch", branch };
    }
    if (stockText === "" || !(stock < settings.threshold)) {
      return {
        skipped: true,
        reason: "not-below-threshold",
        branch,
        stock: stockText,
      };
    }

    const sent = await ctx.step("send-low-stock-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: settings.emails,
          subject: `Low stock at ${branch}: ${product}`,
          body: `${product} at branch ${branch} has ${stock} in stock, below the minimum of ${settings.threshold}.`,
        },
      }),
    );

    return {
      branch,
      product,
      stock,
      emailed: settings.emails,
      sent: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
