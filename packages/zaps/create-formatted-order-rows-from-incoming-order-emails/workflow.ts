import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Gmail search string for order confirmation emails (Gmail search syntax).
const GMAIL_QUERY = 'subject:"order confirmation" in:inbox';
// Google Sheets spreadsheet ID (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Column keys for the master worksheet (COL$A = column A). Map your headers to these letters.
const COLUMNS = {
  orderId: "COL$A",
  email: "COL$B",
  fullName: "COL$C",
  firstName: "COL$D",
  lastName: "COL$E",
  phone: "COL$F",
  address1: "COL$G",
  address2: "COL$H",
  business: "COL$I",
  currency: "COL$J",
  amount: "COL$K",
  source: "COL$L",
  loggedAt: "COL$M",
};
// Words that mark a non-order email (onboarding, course registration, informational mail). Such emails are skipped.
const EXCLUDE_PATTERN = /onboarding|course|registration|newsletter/i;
// Currency symbols mapped to three-letter codes. Codes already written as letters are used as-is.
const CURRENCY_SYMBOLS: Record<string, string> = {
  $: "USD",
  "£": "GBP",
  "€": "EUR",
};

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    from: z
      .object({
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    from__email: z.string().nullable().optional(),
  })
  .loose();

// Reads the first line that starts with one of the labels, e.g. "Email: pat@example.com".
function readField(body: string, labels: string[]): string | null {
  for (const label of labels) {
    const match = body.match(
      new RegExp(`^\\s*${label}\\s*[:#-]\\s*(.+)$`, "im"),
    );
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

function parseOrderEmail(input: z.infer<typeof InputSchema>) {
  const subject = input.subject ?? "";
  const body = input.body_plain ?? "";
  if (EXCLUDE_PATTERN.test(subject) || EXCLUDE_PATTERN.test(body)) return null;

  const orderId =
    subject.match(/#\s*([A-Z0-9][A-Z0-9-]{3,})/i)?.[1] ??
    readField(body, ["Order number", "Order #", "Order ID", "Order"]);
  if (!orderId) return null;

  const totalLine = readField(body, ["Total", "Amount"]);
  const amountMatch = totalLine?.match(
    /([$£€]|[A-Z]{3})?\s*([\d,]+(?:\.\d{1,2})?)/,
  );
  if (!amountMatch) return null;
  const symbolOrCode = amountMatch[1] ?? "";
  const currency = CURRENCY_SYMBOLS[symbolOrCode] ?? (symbolOrCode || "USD");
  const amount = Number(amountMatch[2].replace(/,/g, ""));

  const fullName = readField(body, ["Name", "Customer name", "Customer"]) ?? "";
  const nameParts = fullName.split(/\s+/).filter(Boolean);

  return {
    orderId,
    email: readField(body, ["Email", "Customer email"]) ?? "",
    fullName,
    firstName: nameParts[0] ?? "",
    lastName: nameParts.slice(1).join(" "),
    phone: readField(body, ["Phone"]) ?? "",
    address1: readField(body, ["Address line 1", "Address"]) ?? "",
    address2: readField(body, ["Address line 2"]) ?? "",
    business: readField(body, ["Business", "Company", "Website"]) ?? "",
    currency,
    amount,
  };
}

const workflow = defineDurable<unknown, unknown>(
  "create-formatted-order-rows-from-incoming-order-emails",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const order = parseOrderEmail(input);
    if (!order) {
      return { skipped: true, reason: "not-a-qualifying-order-email" };
    }

    const existing = await ctx.step("find-existing-order-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          lookup_key: COLUMNS.orderId,
          lookup_value: order.orderId,
        },
      }),
    );
    if (existing.data?.[0]) {
      return {
        skipped: true,
        reason: "duplicate-order",
        orderId: order.orderId,
      };
    }

    const loggedAt = await ctx.step("capture-logged-at", async () =>
      new Date().toISOString(),
    );

    const created = await ctx.step("create-order-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [COLUMNS.orderId]: order.orderId,
          [COLUMNS.email]: order.email,
          [COLUMNS.fullName]: order.fullName,
          [COLUMNS.firstName]: order.firstName,
          [COLUMNS.lastName]: order.lastName,
          [COLUMNS.phone]: order.phone,
          [COLUMNS.address1]: order.address1,
          [COLUMNS.address2]: order.address2,
          [COLUMNS.business]: order.business,
          [COLUMNS.currency]: order.currency,
          [COLUMNS.amount]: String(order.amount),
          [COLUMNS.source]: input.from__email ?? input.from?.email ?? "",
          [COLUMNS.loggedAt]: loggedAt,
        },
      }),
    );

    return { orderId: order.orderId, row: created.data?.[0] ?? null };
  },
);

export default workflow;
