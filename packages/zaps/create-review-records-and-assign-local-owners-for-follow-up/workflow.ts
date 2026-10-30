import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table that holds one row per review (the table's ID from its URL).
const TABLE_ID = "YOUR_TABLE_ID";
// Google Business Profile location to watch for new reviews.
const LOCATION_ID = "YOUR_LOCATION_ID";
// Table field keys, in the order the table was created.
const FIELD = {
  externalId: "new__data__f1",
  reviewText: "new__data__f2",
  reviewerName: "new__data__f3",
  rating: "new__data__f4",
  receivedAt: "new__data__f5",
};
// Keys in the New Review trigger payload that hold each value.
// Not yet verified against a live sample: check them with get_trigger_fields once Google Business Profile is authorized.
const REVIEW_ID_KEY = "review_id";
const REVIEW_TEXT_KEY = "comment";
const REVIEWER_NAME_KEY = "reviewer_name";
const RATING_KEY = "star_rating";
const RECEIVED_AT_KEY = "create_time";
// Google sends star ratings as words (FIVE); the Rating field needs a number.
const STAR_WORDS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

const InputSchema = z.object({}).loose();

const workflow = defineDurable<unknown, unknown>(
  "create-review-records-and-assign-local-owners-for-follow-up",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const externalId = String(input[REVIEW_ID_KEY] ?? "").trim();
    if (!externalId) {
      return { skipped: true, reason: "missing-review-id" };
    }

    const row = {
      [FIELD.externalId]: externalId,
      [FIELD.reviewText]: String(input[REVIEW_TEXT_KEY] ?? ""),
      [FIELD.reviewerName]: String(input[REVIEWER_NAME_KEY] ?? ""),
      [FIELD.rating]: String(
        STAR_WORDS[String(input[RATING_KEY])] ?? input[RATING_KEY] ?? "",
      ),
      [FIELD.receivedAt]: String(input[RECEIVED_AT_KEY] ?? "now"),
    };

    const existing = await ctx.step("find-existing-review-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          filter_count: "1",
          use_stored_order: "false",
          field_data_key: FIELD.externalId,
          operator: "exact",
          lookup_value: externalId,
        },
      }),
    );

    const rowId = existing.data?.[0]?.record_id as string | undefined;

    if (rowId) {
      const updated = await ctx.step("update-review-row", async () =>
        sdk.runAction({
          appKey: "zapier-tables",
          actionType: "write",
          actionKey: "update_record",
          connection: "zapier-tables",
          inputs: { table_id: TABLE_ID, record_id: rowId, ...row },
        }),
      );
      return {
        externalId,
        action: "updated",
        recordId: rowId,
        result: updated.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("create-review-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: { table_id: TABLE_ID, ...row },
      }),
    );

    return {
      externalId,
      action: "created",
      recordId: created.data?.[0]?.record_id ?? null,
    };
  },
);

export default workflow;
