import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Quo phone number ID the SMS is sent from (Quo > Settings > Phone numbers).
const QUO_FROM_NUMBER_ID = "YOUR_QUO_PHONE_NUMBER_ID";
// Message body; {first_name} is replaced with the requester's first name.
const SMS_TEMPLATE =
  "Hi {first_name}, thanks for requesting a quote. What is your location, and what service do you need?";

const InputSchema = z
  .object({
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
  })
  .loose();

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.length >= 8 ? digits : "";
}

const workflow = defineDurable<unknown, unknown>(
  "send-sms-for-new-online-quote-to-requester",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const phone = normalizePhone(input.phone ?? "");
    if (!phone) {
      return { skipped: true, reason: "no-valid-phone" };
    }

    const [firstName = "", ...rest] = (input.name ?? "").trim().split(/\s+/);
    const lastName = rest.join(" ");

    const contact = await ctx.step("create-or-update-quo-contact", async () =>
      sdk.runAction({
        appKey: "quo",
        actionType: "write",
        actionKey: "contact_update_create",
        connection: "quo",
        inputs: {
          client_id: phone,
          first_name: firstName,
          last_name: lastName,
          phone_numbers: [phone],
          email_addresses: input.email ? [input.email] : [],
        },
      }),
    );

    const message = await ctx.step("send-quo-sms", async () =>
      sdk.runAction({
        appKey: "quo",
        actionType: "write",
        actionKey: "send_message",
        connection: "quo",
        inputs: {
          phone_number_id: QUO_FROM_NUMBER_ID,
          to: phone,
          body: SMS_TEMPLATE.replace("{first_name}", firstName || "there"),
        },
      }),
    );

    return {
      phone,
      contact: contact.data[0] ?? null,
      message: message.data[0] ?? null,
    };
  },
);

export default workflow;
