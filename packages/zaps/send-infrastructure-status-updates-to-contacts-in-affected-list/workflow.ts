import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Seconds to wait after a contact is added, so rapid list additions go out together.
const DELAY_SECONDS = 60;
// Subject line of the status email.
const STATUS_SUBJECT = "Infrastructure status update";
// Status message body. {name} is replaced with the contact's first name.
const STATUS_TEMPLATE =
  "Hi {name},\n\nWe are aware of an infrastructure issue affecting some of our services and are working on it. We will send another update as soon as we have one.\n\nThank you for your patience.";

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    properties: z
      .object({
        email: z.string().nullable().optional(),
        firstname: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-infrastructure-status-updates-to-contacts-in-affected-list",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const contactId = input.id ?? null;
    const email = input.properties?.email?.trim() ?? "";
    const firstName = input.properties?.firstname?.trim() || "there";

    await ctx.wait("wait-before-send", DELAY_SECONDS);

    // SMS is not used: the SMS by Zapier send action only reaches the connected number, not contacts.
    if (!email) {
      return { skipped: true, reason: "no-email-address", contactId };
    }

    const body = STATUS_TEMPLATE.replace("{name}", firstName);

    const sent = await ctx.step("send-status-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [email],
          subject: STATUS_SUBJECT,
          body,
          send_to_groups: "false",
        },
      }),
    );

    return { sent: true, contactId, messageId: sent.data?.[0]?.id ?? null };
  },
);

export default workflow;
