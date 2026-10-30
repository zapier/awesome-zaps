import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet ID holding the user stories and the output tab (the long ID in the sheet's URL).
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) holding the user stories; the first tab is "0".
const STORIES_WORKSHEET_ID = "0";
// Worksheet (tab) that receives the generated test cases and scripts.
const OUTPUT_WORKSHEET_ID = "YOUR_OUTPUT_WORKSHEET_ID";
// Story columns on the stories tab (COL$A = column A).
const STORY_ID_COLUMN = "COL$A";
const STORY_DESCRIPTION_COLUMN = "COL$B";
// Output columns on the output tab.
const OUTPUT_ID_COLUMN = "COL$A";
const OUTPUT_TEST_IDS_COLUMN = "COL$B";
const OUTPUT_SUMMARY_COLUMN = "COL$C";
const OUTPUT_SCRIPT_COLUMN = "COL$D";
// ChatGPT model used for the test-case and script prompts.
const CHATGPT_MODEL = "gpt-3.5-turbo-instruct";

const InputSchema = z
  .object({
    [STORY_ID_COLUMN]: z.union([z.string(), z.number()]).nullable().optional(),
    [STORY_DESCRIPTION_COLUMN]: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-end-to-end-test-scripts-from-sheet-user-stories",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const storyId = String(input[STORY_ID_COLUMN] ?? "").trim();
    const description = String(input[STORY_DESCRIPTION_COLUMN] ?? "").trim();
    if (!storyId || !description) {
      return {
        skipped: true,
        reason: "story-missing-id-or-description",
        storyId,
      };
    }

    const testCaseResult = await ctx.step("generate-test-cases", async () =>
      sdk.runAction({
        appKey: "chatgpt",
        actionType: "write",
        actionKey: "send_prompt",
        connection: "chatgpt",
        inputs: {
          model: CHATGPT_MODEL,
          prompt: [
            "Write structured end-to-end test cases for this user story. For each test case, use exactly these labelled lines, in this order:",
            "Test ID: TC-<number>",
            "Test Case Name: <name>",
            "Purpose: <one sentence>",
            "Preconditions: <list>",
            "Steps: <numbered actions>",
            "",
            `User story (${storyId}): ${description}`,
          ].join("\n"),
        },
      }),
    );

    const testCaseText = String(testCaseResult.data[0]?.output ?? "");
    const testIds = [...testCaseText.matchAll(/Test ID:\s*(\S+)/g)].map(
      (match) => match[1],
    );
    const testNames = [...testCaseText.matchAll(/Test Case Name:\s*(.+)/g)].map(
      (match) => match[1].trim(),
    );
    const testBlocks = testCaseText
      .split(/(?=Test ID:)/)
      .filter((block) => /Test ID:/.test(block));
    if (testIds.length === 0) {
      return { skipped: true, reason: "no-test-cases-parsed", storyId };
    }

    const scriptResult = await ctx.step("generate-test-script", async () =>
      sdk.runAction({
        appKey: "chatgpt",
        actionType: "write",
        actionKey: "send_prompt",
        connection: "chatgpt",
        inputs: {
          model: CHATGPT_MODEL,
          prompt: [
            "Write a runnable TypeScript end-to-end test script for the test cases below. Follow best practices: one test per test case, arrange-act-assert, clear names, no hard-coded secrets. Return only code.",
            "",
            testBlocks.join("\n\n"),
          ].join("\n"),
        },
      }),
    );

    const row = {
      [OUTPUT_ID_COLUMN]: storyId,
      [OUTPUT_TEST_IDS_COLUMN]: testIds.join(", "),
      [OUTPUT_SUMMARY_COLUMN]: testNames.join("; "),
      [OUTPUT_SCRIPT_COLUMN]: String(scriptResult.data[0]?.output ?? ""),
    };

    const existing = await ctx.step("find-output-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "lookup_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: OUTPUT_WORKSHEET_ID,
          lookup_key: OUTPUT_ID_COLUMN,
          lookup_value: storyId,
        },
      }),
    );

    const match = existing.data?.[0] as { id?: number | string } | undefined;
    if (match?.id) {
      const updated = await ctx.step("update-output-row", async () =>
        sdk.runAction({
          appKey: "google-sheets",
          actionType: "write",
          actionKey: "update_row",
          connection: "google-sheets",
          inputs: {
            spreadsheet: SPREADSHEET_ID,
            worksheet: OUTPUT_WORKSHEET_ID,
            row: String(match.id),
            ...row,
          },
        }),
      );
      return {
        storyId,
        action: "updated",
        row: match.id,
        testIds,
        updated: updated.data?.[0] ?? null,
      };
    }

    const created = await ctx.step("create-output-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: OUTPUT_WORKSHEET_ID,
          ...row,
        },
      }),
    );

    return {
      storyId,
      action: "created",
      testIds,
      created: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
