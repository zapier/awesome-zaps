import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Typeform field key for the review title. Copy it from a sample entry's output.
const TITLE_FIELD = "YOUR_TITLE_FIELD_KEY";
// Typeform field key for the review text.
const BODY_FIELD = "YOUR_BODY_FIELD_KEY";
// Typeform field key for the star rating.
const RATING_FIELD = "YOUR_RATING_FIELD_KEY";
// Typeform field key for the reviewer's name.
const NAME_FIELD = "YOUR_NAME_FIELD_KEY";
// Typeform field key for the reviewer's email. The review endpoint matches reviewers on it.
const EMAIL_FIELD = "YOUR_EMAIL_FIELD_KEY";
// Review platform endpoint that accepts new reviews (a POST URL).
const REVIEW_ENDPOINT_URL = "YOUR_REVIEW_ENDPOINT_URL";
// Product identifier sent with every review.
const PRODUCT_ID = "YOUR_PRODUCT_ID";

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
