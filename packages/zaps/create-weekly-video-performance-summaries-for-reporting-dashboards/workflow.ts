import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// YouTube channel ID to report on (the "UC..." ID of your channel).
const CHANNEL_ID = "YOUR_CHANNEL_ID";
// Metrics requested from the YouTube report.
const METRICS = [
  "views",
  "averageViewDuration",
  "likes",
  "comments",
  "shares",
  "estimatedRevenue",
  "subscribersGained",
  "subscribersLost",
];

const InputSchema = z
  .object({
    video_id: z.string().nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
  })
  .loose();

const toNumber = (value: unknown) => Number(value ?? 0) || 0;

const workflow = defineDurable<unknown, unknown>(
  "create-weekly-video-performance-summaries-for-reporting-dashboards",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const videoId = input.video_id ?? "";
    const zeroed = {
      video_id: videoId,
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
      views: 0,
      average_watch_time_seconds: 0,
      engagement_percentage: 0,
      revenue: 0,
      subscriber_delta: 0,
    };

    if (!videoId || !input.start_date || !input.end_date) {
      return {
        ...zeroed,
        skipped: true,
        reason: "missing-video-or-date-range",
      };
    }

    const report = await ctx.step("get-video-report", async () =>
      sdk.runAction({
        appKey: "youtube",
        actionType: "search",
        actionKey: "get_report",
        connection: "youtube",
        inputs: {
          report_type: "video_top",
          report_breakdown: "Channel",
          channel: CHANNEL_ID,
          metrics: METRICS,
          start_date: input.start_date,
          end_date: input.end_date,
          videos_to_filter: [videoId],
          max_results: "1",
        },
      }),
    );

    const row = report.data?.[0] as Record<string, unknown> | undefined;
    if (!row) {
      return { ...zeroed, reason: "no-report-data" };
    }

    const views = toNumber(row.views);
    const engagements =
      toNumber(row.likes) + toNumber(row.comments) + toNumber(row.shares);

    return {
      video_id: videoId,
      start_date: input.start_date,
      end_date: input.end_date,
      views,
      average_watch_time_seconds: toNumber(row.averageViewDuration),
      engagement_percentage: views ? (engagements / views) * 100 : 0,
      revenue: toNumber(row.estimatedRevenue),
      subscriber_delta:
        toNumber(row.subscribersGained) - toNumber(row.subscribersLost),
    };
  },
);

export default workflow;
