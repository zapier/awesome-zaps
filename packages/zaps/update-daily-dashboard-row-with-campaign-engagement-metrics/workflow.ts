import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Time zone that defines "the day" for the query window and the row date (IANA name).
const TIMEZONE = "America/New_York";
// Analytics endpoint that returns the day's engagement buckets; called with GET ?start=…&end=….
const ANALYTICS_URL = "YOUR_ANALYTICS_ENDPOINT_URL";
// Extra query-string params sent on every call (API key, campaign ID, and so on).
const ANALYTICS_EXTRA_PARAMS: Record<string, string> = {};
// Dot path to the object holding the buckets in the endpoint's JSON response ("" = top level).
const ANALYTICS_METRICS_PATH = "";
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column holding the row's date as YYYY-MM-DD (COL$A = column A).
const DATE_COLUMN = "COL$A";
// Bucket name in the endpoint's response → the sheet column it is written to.
const METRIC_COLUMNS: Record<string, string> = {
  impressions: "COL$B",
  clicks: "COL$C",
  opens: "COL$D",
  conversions: "COL$E",
};

// Schedule by Zapier delivers a small payload; nothing in it is required.
const InputSchema = z.object({}).loose();

// Offset in ms between TIMEZONE wall-clock time and UTC at a given instant.
function zoneOffsetMs(instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - (instant - (instant % 1000));
}

// UTC instant of local midnight in TIMEZONE for a calendar date.
function zonedMidnight(year: number, month: number, day: number): number {
  const guess = Date.UTC(year, month - 1, day);
  const first = guess - zoneOffsetMs(guess);
  return guess - zoneOffsetMs(first);
}

// The run's local date (YYYY-MM-DD) and its start/end-of-day window as ISO timestamps.
function dayWindow(runAt: string) {
  const local = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(runAt));
  const [year, month, day] = local.split("-").map(Number);
  const start = zonedMidnight(year, month, day);
  const nextStart = zonedMidnight(year, month, day + 1);
  return {
    date: local,
    start: new Date(start).toISOString(),
    end: new Date(nextStart - 1).toISOString(),
  };
}

// Turn "1,234", " 37.50 ", "$860.0" or 12 into a plain number string ("1234", "37.5", "860", "12").
function normalizeNumber(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(Number(value.toFixed(4))) : null;
  }
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\s,$€£%]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return String(Number(Number(cleaned).toFixed(4)));
}

function pickPath(value: unknown, path: string): unknown {
  if (!path) return value;
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[key]
          : undefined,
      value,
    );
}

const workflow = defineDurable<unknown, unknown>(
  "update-daily-dashboard-row-with-campaign-engagement-metrics",
  async (ctx, rawInput) => {
    InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : (rawInput ?? {}),
    );

    // Date APIs are non-deterministic in the durable runtime, so the window is journaled as a step.
    const window = await ctx.step("compute-date-range", async () =>
      dayWindow(new Date().toISOString()),
    );

    const response = await ctx.step("fetch-engagement-buckets", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "get",
        inputs: {
          url: ANALYTICS_URL,
          data: {
            ...ANALYTICS_EXTRA_PARAMS,
            start: window.start,
            end: window.end,
          },
          unflatten: "no",
        },
      }),
    );

    const buckets = pickPath(response.data?.[0], ANALYTICS_METRICS_PATH) as
      Record<string, unknown> | undefined;
    if (!buckets || typeof buckets !== "object") {
      throw new Error(
        `Analytics response has no bucket object at "${ANALYTICS_METRICS_PATH || "(top level)"}"`,
      );
    }

    const values: Record<string, string> = {};
    const missing: string[] = [];
    for (const [metric, column] of Object.entries(METRIC_COLUMNS)) {
      const normalized = normalizeNumber(buckets[metric]);
      if (normalized === null) missing.push(metric);
      else values[column] = normalized;
    }
    if (Object.keys(values).length === 0) {
      throw new Error(
        `No numeric buckets in analytics response (expected: ${Object.keys(METRIC_COLUMNS).join(", ")})`,
      );
    }

    const lookup = await ctx.step("find-dashboard-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: DATE_COLUMN,
          lookup_value: window.date,
        },
      }),
    );

    const row = lookup.data?.[0] as { id?: number | string } | undefined;
    if (!row?.id) {
      // Spec default: update existing rows only, never create one.
      throw new Error(
        `No dashboard row found for ${window.date} in ${DATE_COLUMN}`,
      );
    }

    const update = await ctx.step("update-dashboard-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "update_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          row: String(row.id),
          ...values,
        },
      }),
    );

    return {
      date: window.date,
      start: window.start,
      end: window.end,
      row: row.id,
      written: values,
      missing,
      updated: update.data?.[0] ?? null,
    };
  },
);

export default workflow;
