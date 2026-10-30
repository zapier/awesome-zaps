import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Public reply posted under each new review. {name} becomes the reviewer's first name.
const REPLY_TEMPLATE =
  "Hi {name}, thank you for your review! We appreciate you taking the time to share your feedback.";
// Used in place of {name} when the review has no reviewer display name.
const NAME_FALLBACK = "there";

// Review payload from the New Review trigger. Keys are Zapier's flattened keys.
const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    name: z.string(),
    comment: z.string().nullable().optional(),
    starRating: z.string().nullable().optional(),
    reviewer__displayName: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "reply-to-new-public-reviews-with-brief-responses",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const firstName =
      (input.reviewer__displayName ?? "").trim().split(/\s+/)[0] ||
      NAME_FALLBACK;
    const reply = REPLY_TEMPLATE.replace("{name}", firstName);

    const posted = await ctx.step("create-review-reply", async () =>
      sdk.runAction({
        appKey: "google-business-profile",
        actionType: "write",
        actionKey: "create_reply",
        connection: "google-business-profile",
        inputs: {
          reply,
          review_name: input.name,
        },
      }),
    );

    return {
      reviewId: input.id ?? null,
      reply,
      updated: posted.data?.[0] ?? null,
    };
  },
);

export default workflow;
