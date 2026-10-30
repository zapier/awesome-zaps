import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID that holds one row per signer (the table's ID from its URL).
const TABLE_ID = "YOUR_TABLE_ID";

const InputSchema = z
  .object({
    "signatures[]signer_name": z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional(),
    "signatures[]signer_email_address": z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional(),
    signature_request_id: z.string(),
  })
  .loose();

function toList(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

const workflow = defineDurable<unknown, unknown>(
  "create-contract-send-records-with-signer-contact-details",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const requestId = input.signature_request_id.trim();
    const names = toList(input["signatures[]signer_name"]);
    const emails = toList(input["signatures[]signer_email_address"]);

    const sentAt = await ctx.step("capture-sent-at", async () =>
      new Date().toISOString(),
    );

    const created: string[] = [];
    const existing: string[] = [];
    const failed: { email: string; error: string }[] = [];

    for (let index = 0; index < emails.length; index++) {
      const email = emails[index].trim();
      const name = (names[index] ?? "").trim();
      if (!email) {
        continue;
      }

      try {
        // Match on email and request ID, so a repeated event does not add a second row.
        const match = await ctx.step(`find-signer-row-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "search",
            actionKey: "find_record",
            connection: "zapier-tables",
            inputs: {
              table_id: TABLE_ID,
              filter_count: "2",
              field_data_key: "f2",
              operator: "exact",
              lookup_value: email,
              field_data_key_2: "f4",
              operator_2: "exact",
              lookup_value_2: requestId,
            },
          }),
        );

        if (match.data?.length) {
          existing.push(email);
          continue;
        }

        await ctx.step(`create-signer-row-${index}`, async () =>
          sdk.runAction({
            appKey: "zapier-tables",
            actionType: "write",
            actionKey: "create_record",
            connection: "zapier-tables",
            inputs: {
              table_id: TABLE_ID,
              new__data__f1: name,
              new__data__f2: email,
              new__data__f3: sentAt,
              new__data__f4: requestId,
            },
          }),
        );
        created.push(email);
      } catch (error) {
        failed.push({
          email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { requestId, created, existing, failed };
  },
);

export default workflow;
