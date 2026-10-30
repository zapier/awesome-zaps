import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// monday.com board ID to watch and update (the number in the board's URL).
const BOARD_ID = "YOUR_BOARD_ID";
// Column ID of the date column whose change starts the workflow. Set the same value in the trigger's column_id.
const TRIGGER_COLUMN_ID = "YOUR_TRIGGER_COLUMN_ID";
// Column ID of the next-follow-up date column, overwritten on each update.
const NEXT_FOLLOW_UP_COLUMN_ID = "YOUR_NEXT_FOLLOW_UP_COLUMN_ID";
// Status value an item must have to qualify. null = every change qualifies.
const QUALIFYING_STATUS: string | null = null;

const InputSchema = z
  .object({
    itemId: z.union([z.string(), z.number()]),
    date: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
  })
  .loose();

// Adds one day, then moves a Saturday or Sunday result to the following Monday.
function nextFollowUpDate(date: string): string {
  const next = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const weekday = next.getUTCDay();
  if (weekday === 6) next.setUTCDate(next.getUTCDate() + 2);
  if (weekday === 0) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

const workflow = defineDurable<unknown, unknown>(
  "set-next-follow-up-date-for-contact-items",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (!input.date) {
      return { skipped: true, reason: "no-date" };
    }
    if (QUALIFYING_STATUS !== null && input.status !== QUALIFYING_STATUS) {
      return { skipped: true, reason: "status-not-qualifying" };
    }

    const itemId = String(input.itemId).trim();
    const followUp = nextFollowUpDate(input.date);

    const update = await ctx.step("set-next-follow-up-date", async () =>
      sdk.runAction({
        appKey: "monday",
        actionType: "write",
        actionKey: "change_multiple_columns_value",
        connection: "monday",
        inputs: {
          item_id: Number(itemId),
          board_id: Number(BOARD_ID),
          is_override: false,
          [NEXT_FOLLOW_UP_COLUMN_ID]: followUp,
        },
      }),
    );

    return { itemId, followUp, updated: update.data?.[0] ?? null };
  },
);

export default workflow;
