import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Calendar ID of the travel calendar to watch. Set the same value as the trigger's calendarid.
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Base URL of your itinerary site. The token taken from the event's location URL is appended.
const ITINERARY_BASE_URL = "https://YOUR_ITINERARY_SITE/";
// Sender alias on the connected Gmail account. Leave empty to send from the account's default address.
const SENDER_ADDRESS = "";
// Trips with less notice than this (in days) go out right away instead of one day before the trip.
const SHORT_NOTICE_DAYS = 11;
// How many days before the trip the itinerary email goes out.
const SEND_LEAD_DAYS = 1;

const DAY_MS = 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const URL_PATTERN = /https?:\/\/[^\s<>"]+/;

const InputSchema = z
  .object({
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    start: z
      .union([
        z.string(),
        z.object({ dateTime: z.string().nullable().optional() }).loose(),
      ])
      .nullable()
      .optional(),
  })
  .loose();

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const workflow = defineDurable<unknown, unknown>(
  "send-personalized-itinerary-emails-one-day-before-trips",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const summary = input.summary ?? "";
    const description = input.description ?? "";
    const location = input.location ?? "";
    const startIso =
      typeof input.start === "string"
        ? input.start
        : (input.start?.dateTime ?? "");

    const recipient =
      description.match(EMAIL_PATTERN)?.[0] ??
      summary.match(EMAIL_PATTERN)?.[0];
    if (!recipient) {
      return { skipped: true, reason: "no-traveler-email" };
    }

    const locationUrl = location.match(URL_PATTERN)?.[0];
    const token = locationUrl?.split("/").filter(Boolean).pop() ?? "";
    if (!token) {
      return { skipped: true, reason: "no-itinerary-token" };
    }

    const plan = await ctx.step("plan-send-time", async () => {
      const nowMs = Date.now();
      const tripMs = Date.parse(startIso);
      if (Number.isNaN(tripMs)) {
        return {
          skipped: true,
          reason: "bad-trip-start",
          waitSeconds: 0,
          shortNotice: false,
        };
      }
      const noticeDays = (tripMs - nowMs) / DAY_MS;
      if (noticeDays <= SEND_LEAD_DAYS) {
        return {
          skipped: true,
          reason: "trip-too-soon",
          waitSeconds: 0,
          shortNotice: false,
        };
      }
      const shortNotice = noticeDays < SHORT_NOTICE_DAYS;
      const sendAtMs = shortNotice ? nowMs : tripMs - SEND_LEAD_DAYS * DAY_MS;
      return {
        skipped: false,
        reason: null,
        shortNotice,
        waitSeconds: Math.max(0, Math.round((sendAtMs - nowMs) / 1000)),
      };
    });

    if (plan.skipped) {
      return { skipped: true, reason: plan.reason };
    }

    if (plan.waitSeconds > 0) {
      await ctx.wait("wait-until-send-time", plan.waitSeconds);
    }

    const link = `${ITINERARY_BASE_URL}${token}`;
    const subject = `Your itinerary: ${summary || "your upcoming trip"}`;
    const body = `<html><body><p>Hi,</p><p>Your itinerary${summary ? ` for ${escapeHtml(summary)}` : ""} is ready:</p><p><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p></body></html>`;

    const sent = await ctx.step("send-itinerary-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [recipient],
          subject,
          body,
          body_type: "html",
          ...(SENDER_ADDRESS ? { from: SENDER_ADDRESS } : {}),
        },
      }),
    );

    return {
      sent: true,
      recipient,
      shortNotice: plan.shortNotice,
      link,
      email: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
