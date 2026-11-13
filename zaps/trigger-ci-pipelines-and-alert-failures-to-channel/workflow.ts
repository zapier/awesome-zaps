import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  CI_PIPELINE_URL,
  CI_STATUS_URL,
  SLACK_CHANNEL,
  MESSAGE_PREFIX,
  MENTION_TEXT,
} from "./config.ts";

const sdk = createZapierSdk();

// Branches that start a CI run, matched by exact name.
const CI_BRANCHES = ["main", "master"];
// Repositories tagged with any of these topics are skipped. Empty list = no exclusions.
const EXCLUDED_TOPICS: string[] = ["no-ci"];
// If non-empty, only repositories tagged with one of these topics run. Empty list = all repositories.
const ALLOWED_TOPICS: string[] = [];
// Seconds to wait after starting the pipeline, so it can initialize before polling.
const POLL_DELAY_SECONDS = 90;
// Pipeline statuses that mean the run failed. Any other status posts nothing.
const FAILED_STATUSES = ["failed", "error"];
// Set to true to @-mention a Slack user group on failure. Off by default.
const MENTION_ON_FAILURE = false;

const InputSchema = z
  .object({
    repository: z.string(),
    owner: z.string(),
    branch: z.string(),
    topics: z.array(z.string()).nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "trigger-ci-pipelines-and-alert-failures-to-channel",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const topics = input.topics ?? [];

    if (!CI_BRANCHES.includes(input.branch)) {
      return { skipped: true, reason: "branch-not-ci", branch: input.branch };
    }
    if (EXCLUDED_TOPICS.some((topic) => topics.includes(topic))) {
      return {
        skipped: true,
        reason: "repo-excluded",
        repository: input.repository,
      };
    }
    if (
      ALLOWED_TOPICS.length > 0 &&
      !ALLOWED_TOPICS.some((topic) => topics.includes(topic))
    ) {
      return {
        skipped: true,
        reason: "repo-not-allowed",
        repository: input.repository,
      };
    }

    const started = await ctx.step("start-ci-pipeline", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: CI_PIPELINE_URL,
          payload_type: "json",
          data: {
            repository: input.repository,
            owner: input.owner,
            branch: input.branch,
          },
          unflatten: "no",
          extract_variables: "no",
        },
      }),
    );

    const pipelineId = started.data[0]?.json?.id;
    if (!pipelineId) {
      return {
        skipped: true,
        reason: "no-pipeline-id",
        repository: input.repository,
      };
    }

    await ctx.wait("wait-for-pipeline-init", POLL_DELAY_SECONDS);

    const statusCheck = await ctx.step("check-ci-pipeline-status", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "get",
        inputs: {
          url: `${CI_STATUS_URL}/${pipelineId}`,
          as_json: "yes",
          json_key: "json",
          unflatten: "no",
        },
      }),
    );

    const status = statusCheck.data[0]?.json?.status ?? "unknown";
    if (!FAILED_STATUSES.includes(status)) {
      return { alerted: false, reason: "not-failed", status, pipelineId };
    }

    const pipelineLink = `${CI_STATUS_URL}/${pipelineId}`;
    const mention = MENTION_ON_FAILURE ? MENTION_TEXT : "";
    const text = `${MESSAGE_PREFIX}${mention}CI pipeline ${status} for ${input.repository} on ${input.branch}: ${pipelineLink}`;

    const alert = await ctx.step("post-failure-alert", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          link_names: "no",
          add_edit_link: "no",
        },
      }),
    );

    return { alerted: true, status, pipelineId, alert: alert.data[0] ?? null };
  },
);

export default workflow;
