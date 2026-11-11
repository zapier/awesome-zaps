import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
  PHONE_FIELD,
  NAME_FIELD,
  NOTES_FIELD,
  OPT_IN_FIELD,
  SUBMISSION_ID_FIELD,
  DEFAULT_COUNTRY_CODE,
} from "@/config";
import airtable from "@/connections/airtable";

const sdk = createZapierSdk();

// A reply counts as an opt-in when its first word is one of these (case-insensitive).
const OPT_IN_KEYWORDS = ["YES", "Y", "START", "UNSTOP", "SUBSCRIBE", "JOIN"];

const InputSchema = z
  .object({
    message_body: z.string().nullable().optional(),
    sender_number: z.string().nullable().optional(),
    submission_id: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }
  if (raw.trim().startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `${DEFAULT_COUNTRY_CODE}${digits}`;
  }
  return `+${digits}`;
}

function parseOptIn(body: string): { optedIn: boolean; name: string | null } {
  const words = body.split(/\s+/);
  const keyword = (words[0] ?? "").replace(/[^A-Za-z]/g, "").toUpperCase();
  const name = words.slice(1).join(" ").slice(0, 60);
  return { optedIn: OPT_IN_KEYWORDS.includes(keyword), name: name || null };
}

const workflow = defineDurable<unknown, unknown>(
  "add-sms-opt-ins-from-incoming-replies-to-consent-tracker",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const body = (input.message_body ?? "").trim();

    const { optedIn, name } = parseOptIn(body);
    if (!optedIn) {
      return { skipped: true, reason: "no-opt-in-keyword" };
    }

    const phone = normalizePhone(input.sender_number ?? "");
    if (!phone) {
      return { skipped: true, reason: "invalid-sender-number" };
    }

    const record = await ctx.step("create-consent-record", async () =>
      sdk.runAction({
        appKey: "airtable",
        actionType: "write",
        actionKey: "createRecord",
        connection: airtable,
        inputs: {
          applicationId: AIRTABLE_BASE_ID,
          tableName: AIRTABLE_TABLE_NAME,
          [PHONE_FIELD]: phone,
          [NAME_FIELD]: name,
          [NOTES_FIELD]: body,
          [OPT_IN_FIELD]: true,
          [SUBMISSION_ID_FIELD]: String(input.submission_id ?? ""),
        },
      }),
    );

    return { phone, optedIn: true, record: record.data[0] ?? null };
  },
);

export default workflow;
