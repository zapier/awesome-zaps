import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Telegram chat ID of the on-call chat or group (for example "-1001234567890" or "@your_channel"). The bot must be a member of the chat.
const ON_CALL_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID";
// Vibration reading above which an alert is sent.
const VIBRATION_THRESHOLD = 100;
// Decimal places for the formatted vibration value.
const VALUE_PRECISION = 1;
// Prefix alerts with an on-call mention. Keep false for tests.
const MENTION_ON_CALL = false;
// Telegram username to mention when MENTION_ON_CALL is true.
const ON_CALL_MENTION = "@YOUR_ON_CALL_USERNAME";

const InputSchema = z
  .object({
    device_id: z.string().nullable().optional(),
    vibration: z.union([z.string(), z.number()]).nullable().optional(),
    timestamp: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "send-vibration-alert-to-on-call-channel-with-formatted-value",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const raw = Number(input.vibration);
    if (input.vibration == null || !Number.isFinite(raw)) {
      return { skipped: true, reason: "no-vibration-reading" };
    }

    if (raw <= VIBRATION_THRESHOLD) {
      return { skipped: true, reason: "below-threshold", raw };
    }

    const formatted = raw.toFixed(VALUE_PRECISION);
    const device = input.device_id ?? "unknown device";
    const time = input.timestamp ?? "time not provided";
    const mention = MENTION_ON_CALL ? `${ON_CALL_MENTION} ` : "";
    const text = `${mention}Vibration alert: ${device} read ${formatted} (raw ${input.vibration}, threshold ${VIBRATION_THRESHOLD}) at ${time}.`;

    const alert = await ctx.step("send-on-call-alert", async () =>
      sdk.runAction({
        appKey: "telegram",
        actionType: "write",
        actionKey: "send_message",
        connection: "telegram",
        inputs: {
          chat_id: ON_CALL_CHAT_ID,
          format: "plaintext",
          text,
        },
      }),
    );

    return { formatted, device, sent: alert.data?.[0] ?? null };
  },
);

export default workflow;
