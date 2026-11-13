import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { COMPANY_CALENDAR_ID, MIRROR_MARKER } from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    id: z.string(),
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    start: z
      .object({ dateTime: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    end: z
      .object({ dateTime: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable(
  "create-company-calendar-events-from-personal-calendar-updates",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const sourceId = input.id;
    const start = input.start?.dateTime ?? null;
    const end = input.end?.dateTime ?? null;

    if (input.status === "cancelled") {
      return { skipped: true, reason: "cancelled", sourceId };
    }
    if (!start || !end) {
      return { skipped: true, reason: "no-start-or-end-time", sourceId };
    }

    const marker = `${MIRROR_MARKER} ${sourceId}`;
    const summary = input.summary ?? "(no title)";
    const description = [input.description, marker]
      .filter(Boolean)
      .join("\n\n");
    const location = input.location ?? "";

    const found = await ctx.step("find-company-event", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "search",
        actionKey: "event_v2",
        connection: "google-calendar",
        inputs: { calendarid: COMPANY_CALENDAR_ID, search_term: sourceId },
      }),
    );

    const existing = (
      found.data as Array<{ id?: string; description?: string | null }>
    ).find((event) => String(event.description ?? "").includes(marker));

    if (existing?.id) {
      await ctx.step("update-company-event", async () =>
        sdk.runAction({
          appKey: "google-calendar",
          actionType: "write",
          actionKey: "update_event",
          connection: "google-calendar",
          inputs: {
            calendarid: COMPANY_CALENDAR_ID,
            eventid: existing.id,
            summary,
            description,
            location,
            start__dateTime: start,
            end__dateTime: end,
          },
        }),
      );
      return { action: "updated", sourceId, companyEventId: existing.id };
    }

    const created = await ctx.step("create-company-event", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "write",
        actionKey: "detailed_event",
        connection: "google-calendar",
        inputs: {
          calendarid: COMPANY_CALENDAR_ID,
          summary,
          description,
          location,
          start__dateTime: start,
          end__dateTime: end,
        },
      }),
    );

    return {
      action: "created",
      sourceId,
      companyEventId:
        (created.data[0] as { id?: string } | undefined)?.id ?? null,
    };
  },
);

export default workflow;
