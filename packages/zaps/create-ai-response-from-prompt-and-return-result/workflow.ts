import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Model used when the calling workflow does not send one.
const DEFAULT_MODEL = "gpt-4o";
// Seconds to wait before each check of the stored response.
const POLL_INTERVAL_SECONDS = 300;
// Checks before giving up; 12 checks at 5 minutes is one hour.
const MAX_POLLS = 12;

const InputSchema = z
  .object({
    prompt: z.string().nullable().optional(),
    instructions: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
  })
  .loose();

type ResponseBody = {
  id?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

// Strip control characters that break JSON payloads. The request encoder does the JSON escaping.
function sanitize(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

function outputText(body: ResponseBody | undefined): string {
  return (body?.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter(
      (part) => part.type === "output_text" && typeof part.text === "string",
    )
    .map((part) => part.text)
    .join("")
    .trim();
}

const workflow = defineDurable<unknown, unknown>(
  "create-ai-response-from-prompt-and-return-result",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const prompt = sanitize(input.prompt);
    const instructions = sanitize(input.instructions);
    const model = input.model?.trim() || DEFAULT_MODEL;

    if (!prompt) {
      return { ok: false, error: "empty-prompt" };
    }

    const submitted = await ctx.step("submit-chatgpt-request", async () =>
      sdk.runAction({
        appKey: "chatgpt",
        actionType: "write",
        actionKey: "conversation_responses_api",
        connection: "chatgpt",
        inputs: { model, instructions, user_message: prompt },
      }),
    );

    const responseId = (submitted.data[0] as ResponseBody | undefined)?.id;
    if (!responseId) {
      return { ok: false, error: "no-response-id" };
    }

    for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
      await ctx.wait(`wait-before-poll-${attempt}`, POLL_INTERVAL_SECONDS);

      const fetched = await ctx.step(
        `get-chatgpt-response-${attempt}`,
        async () =>
          sdk.runAction({
            appKey: "chatgpt",
            actionType: "write",
            actionKey: "_zap_raw_request",
            connection: "chatgpt",
            inputs: {
              url: `https://api.openai.com/v1/responses/${responseId}`,
              fail_on_errors: "true",
            },
          }),
      );

      const text = outputText(fetched.data[0] as ResponseBody | undefined);
      if (text) {
        return { ok: true, text, responseId };
      }
    }

    return { ok: false, error: "no-content-after-polling", responseId };
  },
);

export default workflow;
