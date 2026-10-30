import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Calendar the trigger watches. Set it as the trigger's calendarid when you publish; the code does not read it.
const CALENDAR_ID = "YOUR_CALENDAR_ID";
// Slack channel ID that receives the routing message (the spec's sub-workflow target).
const ROUTING_CHANNEL = "YOUR_SLACK_CHANNEL_ID";
// Members handed to routing when the event title gives no handle.
const DEFAULT_MEMBERS = ["YOUR_DEFAULT_MEMBER_EMAIL"];
// Set to true to prefix the routing message with @channel. Keep false for tests.
const MENTION_CHANNEL = false;

const DateTimeSchema = z
  .object({ dateTime: z.string().nullable().optional() })
  .loose()
  .nullable()
  .optional();

const InputSchema = z
  .object({
    summary: z.string().nullable().optional(),
    start: DateTimeSchema,
    end: DateTimeSchema,
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "update-active-rotation-event-to-current-on-call-contact",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const startAt = input.start?.dateTime;
    const endAt = input.end?.dateTime;
    if (!startAt || !endAt) {
      return { skipped: true, reason: "no-event-window" };
    }

    // Read the clock inside a step so a replayed run keeps the time it first saw.
    const checkedAt = await ctx.step("capture-checked-at", async () =>
      new Date().toISOString(),
    );
    const now = Date.parse(checkedAt);
    const active = Date.parse(startAt) <= now && now < Date.parse(endAt);
    if (!active) {
      return { skipped: true, reason: "event-not-active", checkedAt };
    }

    const handle = input.summary?.trim() || null;
    const members = handle ? [handle] : DEFAULT_MEMBERS;
    const prefix = MENTION_CHANNEL ? "<!channel> " : "";
    const text = `${prefix}Current on-call: ${handle ?? "(no handle)"}. Window ${startAt} to ${endAt}. Members: ${members.join(", ")}`;

    const routed = await ctx.step("route-on-call-contact", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: ROUTING_CHANNEL,
          text,
          link_names: "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      handle,
      members,
      startAt,
      endAt,
      checkedAt,
      routed: routed.data?.[0] ?? null,
    };
  },
);

export default workflow;
