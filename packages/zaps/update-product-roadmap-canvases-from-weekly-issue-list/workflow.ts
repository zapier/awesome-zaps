import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";

const sdk = createZapierSdk();

// Jira label that marks an issue as roadmap-tracked.
const ROADMAP_LABEL = "roadmap";
// How far back to look for updated issues (JQL relative date).
const LOOKBACK = "-7d";
// Most issues handled per run.
const MAX_ITEMS = 100;
// Jira project key -> product roadmap canvas ID. Issues from a project with no entry are skipped.
const CANVAS_ID_BY_PROJECT_KEY: Record<string, string> = {
  // Replace PROJ and YOUR_CANVAS_ID with your project key and canvas ID.
  PROJ: "YOUR_CANVAS_ID",
};

type JiraIssue = {
  key: string;
  fields?: {
    summary?: string | null;
    duedate?: string | null;
    versions?: unknown;
    priority?: { name?: string | null } | null;
    project?: { key?: string | null } | null;
    status?: {
      name?: string | null;
      statusCategory?: { name?: string | null } | null;
    } | null;
    progress?: { progress?: number | null; total?: number | null } | null;
  } | null;
};

type CanvasUpdate = {
  canvasId: string;
  issueKey: string;
  title: string;
  status: string;
  statusCategory: string;
  priority: string;
  dueDate: string;
  percentDone: number;
};

function toCanvasUpdate(issue: JiraIssue): CanvasUpdate | null {
  const projectKey = issue.fields?.project?.key ?? "";
  const canvasId = CANVAS_ID_BY_PROJECT_KEY[projectKey];
  if (!canvasId) {
    return null;
  }

  const done = Number(issue.fields?.progress?.progress ?? 0);
  const total = Number(issue.fields?.progress?.total ?? 0);

  return {
    canvasId,
    issueKey: issue.key,
    title: issue.fields?.summary ?? "",
    status: issue.fields?.status?.name ?? "",
    statusCategory: issue.fields?.status?.statusCategory?.name ?? "",
    priority: issue.fields?.priority?.name ?? "",
    dueDate: issue.fields?.duedate ?? "",
    percentDone: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

const workflow = defineDurable<unknown, unknown>(
  "update-product-roadmap-canvases-from-weekly-issue-list",
  async (ctx) => {
    const search = await ctx.step("find-roadmap-issues", async () =>
      sdk.runAction({
        appKey: "jira-software-cloud",
        actionType: "search",
        actionKey: "issue_jql",
        connection: "jira-software-cloud",
        inputs: {
          jql: `labels = "${ROADMAP_LABEL}" AND updated >= ${LOOKBACK}`,
          maxResults: MAX_ITEMS,
        },
      }),
    );

    const issues = (search.data as JiraIssue[]).slice(0, MAX_ITEMS);
    const updates = issues
      .map(toCanvasUpdate)
      .filter((update): update is CanvasUpdate => update !== null);
    const skippedCount = issues.length - updates.length;

    if (updates.length === 0) {
      return {
        skipped: true,
        reason: "no-matching-canvas-mapping",
        found: issues.length,
      };
    }

    // Canvas write step: the Sub-Zap update is not built yet (see SKILL.md Customize / Notes).
    return {
      found: issues.length,
      skipped: skippedCount,
      pendingCanvasUpdates: updates,
    };
  },
);

export default workflow;
