import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  TITLE_FIELD,
  BODY_FIELD,
  RATING_FIELD,
  NAME_FIELD,
  EMAIL_FIELD,
  REVIEW_ENDPOINT_URL,
  PRODUCT_ID,
} from "@/config";

const sdk = createZapierSdk();

const InputSchema = z.record(z.string(), z.unknown());

const workflow = defineDurable<unknown, unknown>(
  "post-attendee-feedback-as-product-reviews-for-teams",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const title = input[TITLE_FIELD] ?? null;
    const body = input[BODY_FIELD] ?? null;
    const rating = input[RATING_FIELD] ?? null;

    // Only forward responses that include a rating or review text.
    if (!rating && !body) {
      return { skipped: true, reason: "no-rating-or-text" };
    }

    const review = await ctx.step("post-review-to-endpoint", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: REVIEW_ENDPOINT_URL,
          payload_type: "json",
          unflatten: "no",
          extract_variables: "no",
          data: {
            product_id: PRODUCT_ID,
            reviewer_name: input[NAME_FIELD] ?? null,
            customer_email: input[EMAIL_FIELD] ?? null,
            title,
            body,
            rating,
          },
        },
      }),
    );

    return { posted: review.data[0] ?? null };
  },
);

export default workflow;
