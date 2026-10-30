import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Kit tag ID for the A-group. Pick it from the tag list in Kit (the number in the tag's URL).
const TAG_A_ID = 0; // YOUR_TAG_A_ID
// Kit tag ID for the B-group.
const TAG_B_ID = 0; // YOUR_TAG_B_ID
// Highest value in the random draw; the draw is an integer from 1 to this number.
const RANDOM_RANGE_MAX = 10000000;
// Draws at or below this value go to group A; above it go to group B (about 50/50 at 5,000,000).
const RANDOM_MIDPOINT = 5000000;

const InputSchema = z
  .object({
    email_address: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "assign-randomized-a-b-test-tags-to-new-subscribers",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = (input.email_address ?? "").trim();
    if (!email) {
      return { skipped: true, reason: "no-email" };
    }

    const splitKey = await ctx.step(
      "draw-split-key",
      async () => Math.floor(Math.random() * RANDOM_RANGE_MAX) + 1,
    );

    const group = splitKey <= RANDOM_MIDPOINT ? "A" : "B";
    const tagId = group === "A" ? TAG_A_ID : TAG_B_ID;

    const tagged = await ctx.step(
      group === "A" ? "tag-subscriber-group-a" : "tag-subscriber-group-b",
      async () =>
        sdk.runAction({
          appKey: "kit",
          actionType: "write",
          actionKey: "tagCreate",
          connection: "kit",
          inputs: {
            id: tagId,
            email,
            name: input.first_name ?? undefined,
          },
        }),
    );

    return { email, group, splitKey, tagged: tagged.data?.[0] ?? null };
  },
);

export default workflow;
