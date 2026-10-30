import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Quo phone number that replies are sent from (your business number). Find its ID with Quo's "List Phone Numbers" action.
const BUSINESS_PHONE_NUMBER_ID = "YOUR_QUO_BUSINESS_PHONE_NUMBER_ID";
// Zapier Table with the reply templates. Fields: identifier (the reply code, e.g. "1") and body (the SMS text).
const TEMPLATES_TABLE_ID = "YOUR_TEMPLATES_TABLE_ID";
// Replies that qualify for a template. Any other incoming text is ignored.
const QUALIFYING_REPLIES = ["1", "2", "3"];
// Sent instead when no template matches a qualifying reply.
const FALLBACK_REPLY = "Thanks for your reply. We'll follow up shortly.";

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    from: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
  })
  .loose();
type Input = z.infer<typeof InputSchema>;

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable<Input, unknown>(
  "send-templated-meeting-reply-sms-to-client-texts",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const reply = (input.body ?? "").trim();
    const clientNumber = input.from ?? "";

    if (!clientNumber || !QUALIFYING_REPLIES.includes(reply)) {
      return { skipped: true, reason: "not-a-qualifying-reply" };
    }

    const lookup = await ctx.step("find-reply-template", async () =>
      sdk.runAction({
        appKey: "zapier-tables",
        actionType: "search",
        actionKey: "find_record",
        connection: "zapier-tables",
        inputs: {
          table_id: TEMPLATES_TABLE_ID,
          filter_count: "1",
          field_data_key: "identifier",
          // Lookup value for the identifier field. Confirm this key with inspect_zapier_actions before the first run.
          value_1: reply,
        },
      }),
    );

    const template = lookup.data[0];
    const templateBody =
      typeof template?.old__data__f2 === "string" &&
      template.old__data__f2.trim()
        ? template.old__data__f2
        : null;
    const messageBody = templateBody ?? FALLBACK_REPLY;

    const sent = await ctx.step("send-templated-reply-sms", async () =>
      sdk.runAction({
        appKey: "quo",
        actionType: "write",
        actionKey: "send_message",
        connection: "quo",
        inputs: {
          phone_number_id: BUSINESS_PHONE_NUMBER_ID,
          to: clientNumber,
          body: messageBody,
          mark_as_done: "no",
        },
      }),
    );

    return { sent, usedFallback: templateBody === null };
  },
);

export default workflow;
