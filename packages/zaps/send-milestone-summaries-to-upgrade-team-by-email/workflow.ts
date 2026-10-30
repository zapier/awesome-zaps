import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Calendar the trigger watches (set in the trigger configuration; not read by this code).
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Address the milestone summaries are emailed to. Must be the connected Gmail account's own address.
const UPGRADE_EMAIL = "YOUR_UPGRADE_EMAIL";
// Package codes matched in the event title, checked in this order.
const PACKAGE_CODES = ["ENTERPRISE", "BUSINESS", "PRO", "STARTER"];
// Milestone windows, in days, that get a summary email. The number is read from the event title.
const MILESTONE_DAYS = [30, 60, 90, 180];

const InputSchema = z
  .object({
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    start: z
      .object({ dateTime: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    htmlLink: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-milestone-summaries-to-upgrade-team-by-email",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const title = input.summary ?? "";

    const packageCode = PACKAGE_CODES.find((code) =>
      new RegExp(`\\b${code}\\b`, "i").test(title),
    );
    const milestone = title.match(/\b(30|60|90|180)[- ]?days?\b/i);
    const days = milestone ? Number(milestone[1]) : null;

    if (!packageCode || days === null || !MILESTONE_DAYS.includes(days)) {
      return {
        skipped: true,
        reason: "no-package-or-milestone-in-title",
        title,
      };
    }

    const startedAt = input.start?.dateTime ?? "unknown start time";
    const subject = `${packageCode} ${days}-day milestone (${startedAt})`;
    const body = [
      `Event: ${title}`,
      `Starts: ${startedAt}`,
      "",
      input.description ?? "(no notes)",
      "",
      input.htmlLink ?? "",
    ].join("\n");

    const sent = await ctx.step("send-milestone-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [UPGRADE_EMAIL],
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return {
      sent: true,
      packageCode,
      days,
      subject,
      result: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
