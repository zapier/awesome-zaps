import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// GitHub repository to watch for new commits, as "owner/repo".
const GITHUB_REPO = "YOUR_OWNER/YOUR_REPO";
// Webhook URL of the sub-zap that receives each merged pull request commit.
const SUB_ZAP_URL = "YOUR_SUB_ZAP_WEBHOOK_URL";
// Commit message pattern that marks a merged pull request.
const MERGE_PATTERN = /^Merge pull request #\d+/;

const CommitSchema = z
  .object({
    html_url: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    author_login: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable<unknown, unknown>(
  "create-release-trigger-from-merged-pull-request-commits",
  async (ctx, rawInput) => {
    const commit = CommitSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const message = commit.message ?? "";
    if (!MERGE_PATTERN.test(message)) {
      return { skipped: true, reason: "not-a-merged-pull-request" };
    }

    // https://github.com/<owner>/<repo>/commit/<sha> -> "<owner>/<repo>"
    const commitUrl = commit.html_url ?? "";
    const repo = commitUrl.split("/").slice(3, 5).join("/");

    await ctx.step("post-merged-commit-to-sub-zap", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: SUB_ZAP_URL,
          payload_type: "json",
          data: {
            url: commitUrl,
            message,
            author: commit.author_login ?? null,
            repo,
          },
        },
      }),
    );

    return { repo, commitUrl, posted: true };
  },
);

export default workflow;
