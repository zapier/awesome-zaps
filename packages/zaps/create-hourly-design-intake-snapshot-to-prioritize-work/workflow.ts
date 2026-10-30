import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// Google Sheets spreadsheet holding design requests (the long ID in the sheet's URL).
const INTAKE_SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
// Worksheet (tab) ID; the first tab is "0".
const WORKSHEET_ID = "0";
// Address the digest is emailed to. Must be the connected Gmail account itself.
const DIGEST_RECIPIENT = "YOUR_EMAIL_ADDRESS";
// How many items the digest lists, highest priority first.
const MAX_ITEMS = 15;
// How many rows to read from the sheet (the action allows up to 1,500).
const MAX_ROWS = 200;
// Priority values, highest first. Anything else sorts last.
const PRIORITY_ORDER = ["High", "Medium", "Low"];
// Status values that mean a request is finished and left out of the digest.
const FINISHED_STATUSES = ["Done", "Archived"];

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${INTAKE_SPREADSHEET_ID}/edit`;

const priorityRank = (priority: string) => {
  const index = PRIORITY_ORDER.indexOf(priority);
  return index === -1 ? PRIORITY_ORDER.length : index;
};

const workflow = defineDurable<unknown, unknown>(
  "create-hourly-design-intake-snapshot-to-prioritize-work",
  async (ctx) => {
    const intake = await ctx.step("read-intake-rows", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "search",
        actionKey: "get_many_rows",
        connection: "google-sheets",
        inputs: {
          spreadsheet: INTAKE_SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          range: "A:F",
          first_row: 2,
          row_count: MAX_ROWS,
          output_format: "raw_rows",
        },
      }),
    );

    const rawRows = intake.data[0]?.raw_rows;
    const cells: unknown[][] =
      typeof rawRows === "string" ? JSON.parse(rawRows) : (rawRows ?? []);

    const snapshotAt = await ctx.step("capture-snapshot-at", async () =>
      new Date().toISOString(),
    );

    const seen = new Set<string>();
    const items = cells
      .map((row) => {
        const [
          title = "",
          clientRef = "",
          status = "",
          priority = "",
          owner = "",
          submittedAt = "",
        ] = row.map((cell) => String(cell ?? "").trim());
        return { title, clientRef, status, priority, owner, submittedAt };
      })
      .filter(
        (item) => item.title !== "" && !FINISHED_STATUSES.includes(item.status),
      )
      .filter((item) => {
        // Same title and client reference counts as one request.
        const key = `${item.title.toLowerCase()}|${item.clientRef.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));

    if (items.length === 0) {
      return { skipped: true, reason: "no-active-requests", snapshotAt };
    }

    const top = items.slice(0, MAX_ITEMS);
    const unassigned = items.filter((item) => item.owner === "");
    const highCount = items.filter((item) => item.priority === "High").length;

    const listLines = top.map((item, index) => {
      const owner =
        item.owner === "" ? " [FLAG: unassigned]" : ` (owner: ${item.owner})`;
      return `${index + 1}. ${item.title} [${item.clientRef || "no client ref"}] ${item.priority || "no priority"}, ${item.status}${owner}`;
    });
    const actionLines = unassigned
      .slice(0, MAX_ITEMS)
      .map((item) => `- Assign an owner to: ${item.title}`);

    const subject = `Design intake: ${items.length} active, ${unassigned.length} unassigned`;
    const body = [
      `Active design requests: ${items.length} (${highCount} high priority, ${unassigned.length} unassigned)`,
      `Snapshot taken: ${snapshotAt}`,
      "",
      `Top ${top.length} by priority:`,
      ...listLines,
      "",
      "Action list:",
      ...(actionLines.length > 0 ? actionLines : ["- Nothing to assign"]),
      "",
      `Intake sheet: ${SHEET_URL}`,
    ].join("\n");

    const email = await ctx.step("send-digest-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [DIGEST_RECIPIENT],
          subject,
          body,
          body_type: "plain",
        },
      }),
    );

    return {
      sent: true,
      active: items.length,
      unassigned: unassigned.length,
      listed: top.length,
      subject,
      emailId: email.data?.[0]?.id ?? null,
    };
  },
);

export default workflow;
