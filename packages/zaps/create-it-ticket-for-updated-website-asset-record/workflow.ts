import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Airtable base ID (starts with "app") that holds the asset and IT tickets tables.
const BASE_ID = "YOUR_BASE_ID";
// Website asset table. The trigger watches this table for new or updated records.
const ASSET_TABLE = "YOUR_ASSET_TABLE_NAME";
// Last-modified-time column in the asset table that the trigger uses to detect updates.
const ASSET_MODIFIED_FIELD = "YOUR_LAST_MODIFIED_FIELD";
// IT tickets table where new tickets are created.
const TICKETS_TABLE = "YOUR_TICKETS_TABLE_NAME";
// Asset column holding the unique asset ID. Tickets are matched on it.
const ASSET_ID_FIELD = "Asset ID";
// Asset column holding the title, used in the ticket title.
const ASSET_TITLE_FIELD = "Title";
// Asset column holding the submitter's name, used in the ticket title.
const ASSET_SUBMITTER_FIELD = "Submitter";
// Asset column holding the date, used as the ticket start date.
const ASSET_DATE_FIELD = "Date";
// Asset column holding a link back to the asset record, put in the ticket description.
const ASSET_LINK_FIELD = "Asset link";
// Asset column holding a priority. Only "High" or "Critical" override the default.
const ASSET_PRIORITY_FIELD = "Priority";
// Asset column that receives the new ticket's record ID. Used only if LINK_TICKET_ON_ASSET is true.
const ASSET_TICKET_LINK_FIELD = "IT ticket";
// Set to false to skip writing the ticket link back to the asset row.
const LINK_TICKET_ON_ASSET = true;
// IT tickets column names.
const TICKET_ID_FIELD = "Asset ID";
const TICKET_TITLE_FIELD = "Title";
const TICKET_START_FIELD = "Start date";
const TICKET_DESCRIPTION_FIELD = "Description";
const TICKET_PRIORITY_FIELD = "Priority";
const TICKET_STATUS_FIELD = "Status";
// Status for a newly created ticket (the configured initial state).
const INITIAL_STATUS = "Open";
// Priority used unless the asset flags a higher one.
const DEFAULT_PRIORITY = "Medium";

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
        connection: "airtable",
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
        connection: "airtable",
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
          connection: "airtable",
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
