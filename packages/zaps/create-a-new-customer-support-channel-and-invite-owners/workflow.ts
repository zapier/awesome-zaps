import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Slack user IDs (U…) of the support account or group members invited to every new channel. Empty skips the invite.
const SUPPORT_USER_IDS: string[] = [];
// Prefix for every channel name, e.g. "cust" gives "cust-acme-onboarding".
const CHANNEL_PREFIX = "cust";
// How many numeric suffixes (-2, -3, …) to try when the channel name is already taken.
const MAX_NAME_ATTEMPTS = 5;

const InputSchema = z
  .object({
    customer_reference: z.union([z.string(), z.number()]),
    brief_title: z.string().nullable().optional(),
    owner_slack_id: z.string().nullable().optional(),
  })
  .loose();

// Slack names: lowercase, letters/digits/hyphens/underscores, at most 80 characters.
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const workflow = defineDurable<unknown, unknown>(
  "create-a-new-customer-support-channel-and-invite-owners",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const customerReference = String(input.customer_reference).trim();
    const briefTitle = (input.brief_title ?? "").trim();
    const ownerId = (input.owner_slack_id ?? "").trim();

    const baseName =
      [CHANNEL_PREFIX, customerReference, briefTitle]
        .map(slugify)
        .filter(Boolean)
        .join("-")
        .slice(0, 76)
        .replace(/-$/, "") || "customer";

    // Try the base name, then base-2, base-3, … while Slack reports the name as taken.
    let channel: { id: string; name: string } | null = null;
    let lastError = "";
    for (let attempt = 1; attempt <= MAX_NAME_ATTEMPTS && !channel; attempt++) {
      const name = attempt === 1 ? baseName : `${baseName}-${attempt}`;
      const created = await ctx.step(`create-channel-${attempt}`, async () => {
        try {
          const result = await sdk.runAction({
            appKey: "slack",
            actionType: "write",
            actionKey: "new_channel",
            connection: "slack",
            inputs: { name },
          });
          const item = result.data?.[0] as
            { channel?: { id?: string; name?: string } } | undefined;
          return {
            ok: true,
            id: item?.channel?.id ?? null,
            name: item?.channel?.name ?? name,
          };
        } catch (error) {
          return { ok: false, error: errorText(error).slice(0, 300) };
        }
      });
      if (created.ok && created.id) {
        channel = { id: created.id, name: created.name };
      } else {
        lastError = created.error ?? "no channel id returned";
        if (!/name_taken|already|taken/i.test(lastError)) break;
      }
    }

    if (!channel) {
      throw new Error(`Could not create channel "${baseName}": ${lastError}`);
    }
    const channelId = channel.id;

    let ownerInvited = false;
    if (ownerId) {
      await ctx.step("invite-owner", async () =>
        sdk.runAction({
          appKey: "slack",
          actionType: "write",
          actionKey: "channels_invite_v2",
          connection: "slack",
          inputs: { channel: channelId, users: [ownerId] },
        }),
      );
      ownerInvited = true;
    }

    const supportIds = SUPPORT_USER_IDS.filter((id) => id && id !== ownerId);
    if (supportIds.length > 0) {
      await ctx.step("invite-support-community", async () =>
        sdk.runAction({
          appKey: "slack",
          actionType: "write",
          actionKey: "channels_invite_v2",
          connection: "slack",
          inputs: { channel: channelId, users: supportIds },
        }),
      );
    }

    return {
      channel_id: channelId,
      channel_name: channel.name,
      owner_invited: ownerInvited,
      owner_skipped_reason: ownerId ? null : "no-owner-slack-id",
      support_invited: supportIds.length,
    };
  },
);

export default workflow;
