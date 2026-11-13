import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  WATCHED_CHANNEL,
  SLACK_WORKSPACE_URL,
  INTEL_DOC_TITLE,
} from "./config.ts";

const sdk = createZapierSdk();

// Words that flag a message for capture (case-insensitive substring match).
const FLAG_KEYWORDS = ["competitor", "competitive", "pricing", "launch"];

const InputSchema = z
  .object({
    text: z.string().nullable().optional(),
    ts: z.string(),
    channel: z.string().nullable().optional(),
    user: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
  })
  .loose();

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

const workflow = defineDurable(
  "append-flagged-channel-messages-to-competitor-intelligence-doc",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(normalizeInput(rawInput));
    const text = (input.text ?? "").trim();

    const lowered = text.toLowerCase();
    const flagged = FLAG_KEYWORDS.some((keyword) => lowered.includes(keyword));
    if (!flagged) {
      return { skipped: true, reason: "not-flagged", ts: input.ts };
    }

    const postedAt = await ctx.step("format-posted-at", async () =>
      new Date(Number(input.ts) * 1000).toISOString(),
    );
    const author = input.username ?? input.user ?? "unknown author";
    const channel = input.channel ?? WATCHED_CHANNEL;
    const permalink = `${SLACK_WORKSPACE_URL}/archives/${channel}/p${input.ts.replace(".", "")}`;

    const found = await ctx.step("find-intelligence-doc", async () => {
      const result = await sdk.runAction({
        appKey: "google-docs",
        actionType: "search",
        actionKey: "document",
        connection: "google-docs",
        inputs: { title: INTEL_DOC_TITLE },
      });
      return {
        id: (result.data[0] as { id?: string } | undefined)?.id ?? null,
      };
    });

    let docId: string | null = found.id;
    if (!docId) {
      const created = await ctx.step("create-intelligence-doc", async () => {
        const result = await sdk.runAction({
          appKey: "google-docs",
          actionType: "write",
          actionKey: "newtxtdocument",
          connection: "google-docs",
          inputs: {
            title: INTEL_DOC_TITLE,
            file: "Competitor intelligence. Flagged channel messages are appended below.",
          },
        });
        return {
          id: (result.data[0] as { id?: string } | undefined)?.id ?? null,
        };
      });
      docId = created.id;
    }
    if (!docId) {
      throw new Error(
        "Could not find or create the competitor intelligence document",
      );
    }

    const existing = await ctx.step("read-intelligence-doc", async () => {
      const result = await sdk.runAction({
        appKey: "google-docs",
        actionType: "search",
        actionKey: "get_document_content",
        connection: "google-docs",
        inputs: { document_id: docId },
      });
      const row = result.data[0] as { text_content?: unknown } | undefined;
      return { text: String(row?.text_content ?? "") };
    });

    if (existing.text.includes(input.ts) && existing.text.includes(text)) {
      return { skipped: true, reason: "duplicate", ts: input.ts };
    }

    const entry = `${postedAt} | ${author} | ts ${input.ts} | ${permalink}\n${text}`;

    await ctx.step("append-flagged-message", async () => {
      const result = await sdk.runAction({
        appKey: "google-docs",
        actionType: "write",
        actionKey: "append",
        connection: "google-docs",
        inputs: { file: docId, text: entry },
      });
      return { appended: result.data.length };
    });

    return { appended: true, ts: input.ts, postedAt, permalink };
  },
);

export default workflow;
