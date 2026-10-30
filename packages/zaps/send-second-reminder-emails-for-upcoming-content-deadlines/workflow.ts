import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Your company's email domain. Contributors on this domain are skipped (internal-only addresses).
const INTERNAL_DOMAIN = "YOUR_COMPANY_DOMAIN";
// Text in the event description that means a submission has already arrived. Matched case-insensitively.
const SUBMISSION_MARKER = "submission received";
// Addresses that get a blind copy of every reminder.
const BCC_RECIPIENTS = ["YOUR_EMAIL_ADDRESS"];
// Time zone used when writing the event date into the email.
const TIMEZONE = "America/New_York";

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

const InputSchema = z
  .object({
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    start__dateTime: z.string().nullable().optional(),
    id: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-second-reminder-emails-for-upcoming-content-deadlines",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const summary = input.summary ?? "";
    const description = input.description ?? "";

    if (description.toLowerCase().includes(SUBMISSION_MARKER)) {
      return { skipped: true, reason: "submission-already-received" };
    }

    const contributorEmail =
      (description.match(EMAIL_PATTERN) ?? summary.match(EMAIL_PATTERN))?.[0] ??
      null;
    if (!contributorEmail) {
      return { skipped: true, reason: "no-contributor-email" };
    }
    if (contributorEmail.toLowerCase().endsWith(`@${INTERNAL_DOMAIN}`)) {
      return { skipped: true, reason: "internal-address" };
    }

    // The contributor's name is the part of the event title after a dash, e.g. "Essay - Jane Doe".
    const summaryParts = summary.split(/\s[-–]\s/);
    const contributorName =
      summaryParts.length > 1
        ? summaryParts[summaryParts.length - 1].trim()
        : "there";

    const startDate = input.start__dateTime
      ? new Date(input.start__dateTime)
      : null;
    const formattedDate =
      startDate && !Number.isNaN(startDate.getTime())
        ? startDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: TIMEZONE,
          })
        : "the scheduled date";

    const locationSentence = input.location
      ? ` The location is ${input.location}.`
      : "";
    const subject = `Second reminder: "${summary}" is scheduled for ${formattedDate}`;
    const body = `Hi ${contributorName},\n\nThis is a second reminder that "${summary}" is scheduled for ${formattedDate}.${locationSentence} If you have not sent your submission yet, please send it before then.\n\nThanks!`;

    await ctx.step("send-second-reminder-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [contributorEmail],
          bcc: BCC_RECIPIENTS,
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return { sent: true, to: contributorEmail, eventId: input.id ?? null };
  },
);

export default workflow;
