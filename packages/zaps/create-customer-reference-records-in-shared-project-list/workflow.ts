import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Microsoft SharePoint site ID that holds the shared customer reference list.
const SITE_ID = "YOUR_SITE_ID";
// SharePoint list ID of the shared customer reference list.
const LIST_ID = "YOUR_LIST_ID";
// List column that stores the QuickBooks customer ID. Used to find an existing reference.
const CUSTOMER_ID_COLUMN = "YOUR_CUSTOMER_ID_COLUMN";
// List column for the customer's primary email address.
const EMAIL_COLUMN = "YOUR_EMAIL_COLUMN";
// List column for the customer's primary phone number.
const PHONE_COLUMN = "YOUR_PHONE_COLUMN";

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

const workflow = defineDurable<unknown, unknown>(
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
