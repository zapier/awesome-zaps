import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Search string the YouTube trigger watches for new uploads (your topic).
const TOPIC_QUERY = "YOUR_TOPIC_QUERY";
// Keyword a video title must contain to be kept (case-insensitive).
const TITLE_KEYWORD = "YOUR_TOPIC_KEYWORD";
// Zapier Tables table ID of the content database that receives rows.
const TABLE_ID = "YOUR_TABLE_ID";

const InputSchema = z
  .object({
    title: z.string().nullable().optional(),
    channel: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    published_at: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "aggregate-topic-videos-into-a-searchable-content-table",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const title = input.title ?? "";

    if (!title.toLowerCase().includes(TITLE_KEYWORD.toLowerCase())) {
      return { skipped: true, reason: "title-keyword-not-found", title };
    }

    const row = await ctx.step("add-video-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          new__data__f1: title,
          new__data__f2: input.channel ?? "",
          new__data__f3: input.url ?? "",
          new__data__f4: input.published_at ?? "",
          new__data__f5: input.description ?? "",
        },
      }),
    );

    return { title, created: row.data?.[0] ?? null };
  },
);

export default workflow;
