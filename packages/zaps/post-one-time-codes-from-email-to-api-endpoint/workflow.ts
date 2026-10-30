import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Verification endpoint that receives the code as JSON (POST).
const ENDPOINT_URL = "YOUR_ENDPOINT_URL";
// The vendor's sender address. Emails from it always pass the filter; others pass only if a code is found.
const VENDOR_SENDER = "YOUR_VENDOR_SENDER_EMAIL";
// Shortest and longest code accepted, in digits.
const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 8;

// "code: 482913", "passcode is 482913", "OTP - 4829" ...
const KEYWORD_CODE_PATTERN = new RegExp(
  `(?:code|passcode|otp|pin)\\b[^\\d\\n]{0,40}(\\d{${MIN_CODE_LENGTH},${MAX_CODE_LENGTH}})\\b`,
  "i",
);
// A bare 6-digit number anywhere in the body.
const BARE_CODE_PATTERN = /\b(\d{6})\b/;

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    from: z
      .object({
        email: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

function extractCode(body: string): string | null {
  const keyword = body.match(KEYWORD_CODE_PATTERN);
  if (keyword) return keyword[1];
  const bare = body.match(BARE_CODE_PATTERN);
  return bare ? bare[1] : null;
}

const workflow = defineDurable<unknown, unknown>(
  "post-one-time-codes-from-email-to-api-endpoint",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const body = input.body_plain ?? "";
    const sender = (input.from?.email ?? "").trim().toLowerCase();
    const subject = input.subject ?? "";

    const code = extractCode(body);
    const fromVendor =
      sender !== "" && sender === VENDOR_SENDER.trim().toLowerCase();
    if (!fromVendor && !code) {
      return { skipped: true, reason: "not-a-code-email", sender, subject };
    }

    // No message or thread IDs: only the code and minimal source metadata leave the inbox.
    const payload: Record<string, string> = code
      ? { code, extraction: "matched" }
      : { code: "", extraction: "failed", body: body.trim() };
    payload.source_sender = sender;
    payload.source_subject = subject;
    payload.source_received_at = input.date ?? "";

    const response = await ctx.step("post-code-to-endpoint", async () => {
      const result = await sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: ENDPOINT_URL,
          payload_type: "json",
          data: payload,
          unflatten: "no",
          extract_variables: "no",
        },
      });
      const item = (result.data?.[0] ?? {}) as Record<string, unknown>;
      // Keep the journal small: echo back only the response's top-level keys and any json echo.
      return { keys: Object.keys(item).slice(0, 20), json: item.json ?? null };
    });

    return {
      posted: true,
      extraction: payload.extraction,
      code: payload.code,
      response,
    };
  },
);

export default workflow;
