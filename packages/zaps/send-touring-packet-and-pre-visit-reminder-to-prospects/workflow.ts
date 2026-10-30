import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Link to the touring packet the prospect receives by email.
const TOURING_PACKET_URL = "YOUR_TOURING_PACKET_URL";
// Name the packet email is signed with.
const AGENT_NAME = "YOUR_NAME";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    start: z
      .object({ dateTime: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

// Reads a "Label: value" line from the event description.
function readField(description: string, label: string): string | null {
  const match = description.match(new RegExp(`^${label}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

const workflow = defineDurable<unknown, unknown>(
  "send-touring-packet-and-pre-visit-reminder-to-prospects",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const description = input.description ?? "";
    const prospectName = readField(description, "Prospect") ?? "there";
    const prospectEmail = readField(description, "Email");

    if (!prospectEmail || !EMAIL_PATTERN.test(prospectEmail)) {
      return {
        skipped: true,
        reason: "no-prospect-email",
        eventId: input.id ?? null,
      };
    }

    const startsAt = input.start?.dateTime ?? null;
    const subject = "Your touring packet";
    const body = [
      `Hi ${prospectName},`,
      "",
      `Thanks for booking your visit${startsAt ? ` on ${startsAt}` : ""}. Your touring packet is here: ${TOURING_PACKET_URL}`,
      "",
      `See you soon,`,
      AGENT_NAME,
    ].join("\n");

    const sent = await ctx.step("send-touring-packet-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: { to: [prospectEmail], subject, body },
      }),
    );

    return {
      sent: true,
      to: prospectEmail,
      eventId: input.id ?? null,
      emailId: sent.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
