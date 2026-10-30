import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Quo phone number ID the acknowledgement SMS is sent from (the "From" line).
const QUO_FROM_PHONE_NUMBER_ID = "YOUR_QUO_PHONE_NUMBER_ID";
// Zapier Table ID of the central weight log (the table the rows are added to).
const TABLE_ID = "YOUR_TABLE_ID";
// Weights must be greater than this to be logged.
const MIN_WEIGHT = 0;
// Acknowledgement SMS; {weight} is replaced with the logged value.
const ACK_TEMPLATE = "Thanks, logged your weight: {weight}.";

const InputSchema = z
  .object({
    body: z.string().nullable().optional(),
    from: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
  })
  .loose();

function parseWeight(text: string): number | null {
  const match = text.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }
  const value = Number(match[0]);
  return value > MIN_WEIGHT ? value : null;
}

const workflow = defineDurable<unknown, unknown>(
  "create-weight-log-record-from-client-sms-messages",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const text = input.body ?? "";
    const weight = parseWeight(text);
    if (weight === null) {
      return { skipped: true, reason: "no-weight-found" };
    }

    const record = await ctx.step("create-weight-log-row", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "write",
        actionKey: "create_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TABLE_ID,
          new__data__f1: input.createdAt ?? "now",
          new__data__f2: input.from ?? "",
          new__data__f3: text,
          new__data__f4: String(weight),
        },
      }),
    );

    if (!input.from) {
      return {
        logged: true,
        weight,
        recordId: record.data?.[0] ?? null,
        acknowledged: false,
      };
    }

    const ack = await ctx.step("send-acknowledgement-sms", async () =>
      sdk.runAction({
        appKey: "quo",
        actionType: "write",
        actionKey: "send_message",
        connection: "quo",
        inputs: {
          to: input.from,
          body: ACK_TEMPLATE.replace("{weight}", String(weight)),
          phone_number_id: QUO_FROM_PHONE_NUMBER_ID,
        },
      }),
    );

    return {
      logged: true,
      weight,
      recordId: record.data?.[0] ?? null,
      acknowledged: true,
      ack: ack.data?.[0] ?? null,
    };
  },
);

export default workflow;
