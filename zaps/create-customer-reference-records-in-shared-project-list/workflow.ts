import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SITE_ID,
  LIST_ID,
  CUSTOMER_ID_COLUMN,
  EMAIL_COLUMN,
  PHONE_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    Id: z.union([z.string(), z.number()]).nullable().optional(),
    DisplayName: z.string().nullable().optional(),
    PrimaryEmailAddr: z
      .object({ Address: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    PrimaryPhone: z
      .object({ FreeFormNumber: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable(
  "create-customer-reference-records-in-shared-project-list",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const customerId = String(input.Id ?? "").trim();
    if (!customerId) {
      return { skipped: true, reason: "customer-id-missing" };
    }

    const fields = {
      Title: input.DisplayName ?? "",
      [CUSTOMER_ID_COLUMN]: customerId,
      [EMAIL_COLUMN]: input.PrimaryEmailAddr?.Address ?? "",
      [PHONE_COLUMN]: input.PrimaryPhone?.FreeFormNumber ?? "",
    };

    const lookup = await ctx.step("find-customer-reference-item", async () =>
      sdk.runAction({
        appKey: "sharepoint",
        actionType: "search",
        actionKey: "find_list_item",
        connection: "sharepoint",
        inputs: {
          siteId: SITE_ID,
          listId: LIST_ID,
          [CUSTOMER_ID_COLUMN]: customerId,
        },
      }),
    );

    const existing = lookup.data?.[0] as { id?: number | string } | undefined;

    if (existing?.id) {
      const update = await ctx.step(
        "update-customer-reference-item",
        async () =>
          sdk.runAction({
            appKey: "sharepoint",
            actionType: "write",
            actionKey: "update_list_item",
            connection: "sharepoint",
            inputs: {
              siteId: SITE_ID,
              listId: LIST_ID,
              itemId: String(existing.id),
              ...fields,
            },
          }),
      );

      return {
        action: "updated",
        customerId,
        itemId: existing.id,
        result: update.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("create-customer-reference-item", async () =>
      sdk.runAction({
        appKey: "sharepoint",
        actionType: "write",
        actionKey: "create_list_item",
        connection: "sharepoint",
        inputs: {
          siteId: SITE_ID,
          listId: LIST_ID,
          ...fields,
        },
      }),
    );

    return {
      action: "created",
      customerId,
      result: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
