import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID that holds the training programs (the long ID in the table's URL).
const TRAINING_TABLE_ID = "YOUR_TABLE_ID";
// Table field key for the program key to match exactly (f1 = first column).
const PROGRAM_KEY_FIELD = "f1";
// Table field key for the program link to copy (f2 = second column).
const PROGRAM_LINK_FIELD = "f2";
// Pipedrive custom field key on the person that holds the training/program reference.
const PERSON_TRAINING_FIELD = "YOUR_PIPEDRIVE_TRAINING_FIELD_KEY";
// Pipedrive custom field key on the person that receives the program link.
const PERSON_LINK_FIELD = "YOUR_PIPEDRIVE_LINK_FIELD_KEY";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "add-training-program-link-to-new-person-records",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const personId = String(input.id ?? "").trim();
    const programKey = String(input[PERSON_TRAINING_FIELD] ?? "").trim();

    if (!personId || !programKey) {
      return { skipped: true, reason: "no-training-reference", personId };
    }

    const lookup = await ctx.step("find-training-program", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TRAINING_TABLE_ID,
          filter_count: "1",
          field_data_key: PROGRAM_KEY_FIELD,
          operator: "exact",
          lookup_value: programKey,
        },
      }),
    );

    const match = lookup.data[0] as
      { old?: { data?: Record<string, string | null> } } | undefined;
    const link = match?.old?.data?.[PROGRAM_LINK_FIELD];
    if (!link) {
      return {
        skipped: true,
        reason: "no-matching-program",
        personId,
        programKey,
      };
    }

    const update = await ctx.step("write-program-link-to-person", async () =>
      sdk.runAction({
        appKey: "pipedrive",
        actionType: "write",
        actionKey: "update_personV2",
        connection: "pipedrive",
        inputs: {
          id: Number(personId),
          [PERSON_LINK_FIELD]: link,
        },
      }),
    );

    return { personId, programKey, link, updated: update.data[0] ?? null };
  },
);

export default workflow;
