// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const TAG_A_ID = "REPLACE_TAG_A_ID"; // Look up with the user's Kit connection the tag for group A from the tag list. Must differ from the trigger tag.
export const TAG_B_ID = "REPLACE_TAG_B_ID"; // Look up with the user's Kit connection the tag for group B from the tag list. Must differ from the trigger tag and TAG_A_ID.

// Highest value in the random draw; the draw is an integer from 1 to this number.
export const RANDOM_RANGE_MAX = 10000000;
// Draws at or below this value go to group A; above it go to group B (about 50/50 at 5,000,000).
export const RANDOM_MIDPOINT = 5000000;
