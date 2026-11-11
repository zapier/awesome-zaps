import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  BASE_ID,
  ASSET_TABLE,
  TICKETS_TABLE,
  ASSET_ID_FIELD,
  ASSET_TITLE_FIELD,
  ASSET_SUBMITTER_FIELD,
  ASSET_DATE_FIELD,
  ASSET_LINK_FIELD,
  ASSET_PRIORITY_FIELD,
  ASSET_TICKET_LINK_FIELD,
  TICKET_ID_FIELD,
  TICKET_TITLE_FIELD,
  TICKET_START_FIELD,
  TICKET_DESCRIPTION_FIELD,
  TICKET_PRIORITY_FIELD,
  TICKET_STATUS_FIELD,
  INITIAL_STATUS,
  DEFAULT_PRIORITY,
} from "@/config";
import airtable from "@/connections/airtable";

const sdk = createZapierSdk();

// Set to false to skip writing the ticket link back to the asset row.
const LINK_TICKET_ON_ASSET = true;

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
  })
  .loose();

const text = (value: unknown) => (value == null ? "" : String(value).trim());

const workflow = defineDurable<unknown, unknown>(
  "create-it-ticket-for-updated-website-asset-record",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const assetId = text(input[ASSET_ID_FIELD]);
    if (!assetId) {
      return { skipped: true, reason: "no-asset-id" };
    }

    const existing = await ctx.step("find-existing-ticket", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "search",
        actionKey: "findRecord",
        connection: airtable,
        inputs: {
          applicationId: BASE_ID,
          tableName: TICKETS_TABLE,
          searchByField: TICKET_ID_FIELD,
          searchByValue: assetId,
        },
      }),
    );

    if (existing.data?.length) {
      return { skipped: true, reason: "ticket-exists", assetId };
    }

    const title = [
      text(input[ASSET_TITLE_FIELD]),
      text(input[ASSET_SUBMITTER_FIELD]),
    ]
      .filter(Boolean)
      .join(" - ");
    const startDate = text(input[ASSET_DATE_FIELD]);
    const assetLink = text(input[ASSET_LINK_FIELD]);
    const flagged = text(input[ASSET_PRIORITY_FIELD]);
    const priority = ["High", "Critical"].includes(flagged)
      ? flagged
      : DEFAULT_PRIORITY;

    const ticket = await ctx.step("create-it-ticket", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "createRecord",
        connection: airtable,
        inputs: {
          applicationId: BASE_ID,
          tableName: TICKETS_TABLE,
          [TICKET_ID_FIELD]: assetId,
          [TICKET_TITLE_FIELD]: title,
          [TICKET_START_FIELD]: startDate || null,
          [TICKET_DESCRIPTION_FIELD]: assetLink,
          [TICKET_PRIORITY_FIELD]: priority,
          [TICKET_STATUS_FIELD]: INITIAL_STATUS,
        },
      }),
    );

    const ticketId = ticket.data?.[0]?.id;

    // This update fires the trigger again. The find-existing-ticket check stops a second ticket.
    if (LINK_TICKET_ON_ASSET && input.id && ticketId) {
      await ctx.step("link-ticket-on-asset", async () =>
        sdk.runAction({
          appKey: "airtable",
          actionType: "write",
          actionKey: "updateRecord",
          connection: airtable,
          inputs: {
            applicationId: BASE_ID,
            tableName: ASSET_TABLE,
            rowId: String(input.id),
            [ASSET_TICKET_LINK_FIELD]: String(ticketId),
          },
        }),
      );
    }

    return { assetId, ticketId: ticketId ?? null, priority };
  },
);

export default workflow;
