import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Zapier Tables table ID that holds the motor claims (the trigger's table).
const CLAIMS_TABLE_ID = "YOUR_TABLE_ID";
// Address that receives each notification. Use the connected Outlook account's own address for tests.
const CLAIMS_INBOX = "YOUR_CLAIMS_INBOX_EMAIL";
// Time zone (IANA name) used when printing dates.
const TIME_ZONE = "UTC";
// Field holding the claimant's name.
const NAME_FIELD = "name";
// Field holding the claimant's contact details (phone or email).
const CONTACT_FIELD = "contact";
// Field holding the vehicle insurance expiry date.
const VEHICLE_EXPIRY_FIELD = "vehicle_expiry";
// Field holding the driving licence expiry date.
const DRIVING_EXPIRY_FIELD = "driving_expiry";
// Field holding the accident date and time.
const ACCIDENT_DATETIME_FIELD = "accident_datetime";
// Field holding uploaded attachment URLs (a list, or a single URL).
const ATTACHMENTS_FIELD = "attachments";

type ZonedParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  dayPeriod: string;
};

function zonedParts(value: unknown): ZonedParts | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  return Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  ) as ZonedParts;
}

// DD/MM/YYYY, or DD/MM/YYYY hh:mm A when withTime is set.
function formatDate(value: unknown, withTime: boolean): string {
  const parts = zonedParts(value);
  if (!parts) return "";
  const day = `${parts.day}/${parts.month}/${parts.year}`;
  return withTime
    ? `${day} ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`
    : day;
}

// Calendar day as a sortable number (YYYYMMDD), so times on the same day compare equal.
function dayKey(value: unknown): number | null {
  const parts = zonedParts(value);
  if (!parts) return null;
  return Number(`${parts.year}${parts.month}${parts.day}`);
}

function expiredBeforeAccident(expiry: unknown, accident: unknown): boolean {
  const expiryDay = dayKey(expiry);
  const accidentDay = dayKey(accident);
  return expiryDay !== null && accidentDay !== null && expiryDay < accidentDay;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function toAttachmentUrls(value: unknown): string[] {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return items
    .map((item) =>
      typeof item === "string" ? item : (item as { url?: unknown })?.url,
    )
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

const ClaimInputSchema = z.looseObject({});

const workflow = defineDurable<unknown, unknown>(
  "send-new-motor-claim-notification-to-claims-team",
  async (ctx, rawInput) => {
    const input = ClaimInputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const name = String(input[NAME_FIELD] ?? "");
    const contact = String(input[CONTACT_FIELD] ?? "");
    const accidentDateTime = input[ACCIDENT_DATETIME_FIELD];
    const vehicleExpiry = input[VEHICLE_EXPIRY_FIELD];
    const drivingExpiry = input[DRIVING_EXPIRY_FIELD];
    const attachments = toAttachmentUrls(input[ATTACHMENTS_FIELD]);

    const alerts: string[] = [];
    if (expiredBeforeAccident(vehicleExpiry, accidentDateTime)) {
      alerts.push("Vehicle insurance expired before the accident");
    }
    if (expiredBeforeAccident(drivingExpiry, accidentDateTime)) {
      alerts.push("Driving licence expired before the accident");
    }

    const rows: [string, string][] = [
      ["Claimant", name],
      ["Contact", contact],
      ["Accident", formatDate(accidentDateTime, true)],
      ["Vehicle expiry", formatDate(vehicleExpiry, false)],
      ["Driving licence expiry", formatDate(drivingExpiry, false)],
      ["Expiry alerts", alerts.length ? alerts.join("; ") : "None"],
      [
        "Attachments",
        attachments.length ? `${attachments.length} attached` : "None",
      ],
    ];
    const body = `<table>${rows
      .map(
        ([label, value]) =>
          `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`,
      )
      .join("")}</table>`;
    const subject = `Motor claim: ${name || "new claim"}`;

    const sent = await ctx.step("send-claim-notification-email", async () =>
      sdk.runAction({
        appKey: "microsoft-outlook",
        actionType: "write",
        actionKey: "send_email",
        connection: "microsoft-outlook",
        inputs: {
          recipients: [CLAIMS_INBOX],
          subject,
          bodyFormat: "HTML",
          body,
          ...(attachments.length ? { file: attachments } : {}),
        },
      }),
    );

    return { subject, alerts, sent: sent.data[0] ?? null };
  },
);

export default workflow;
