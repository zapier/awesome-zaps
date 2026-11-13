import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  NAME_COLUMN,
  TERMINATION_DATE_COLUMN,
  HIRE_DATE_COLUMN,
  DEPARTMENT_COLUMN,
  HOURS_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

// Department names to record. A termination counts when its department contains any of these, ignoring case.
const TRACKED_DEPARTMENTS = ["Fulfillment"];

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    department: z.unknown(),
    hire_date: z.unknown(),
    termination_date: z.unknown(),
    weekly_working_hours: z.unknown(),
  })
  .loose();

// Personio sends some attributes as plain values and others as { value } or { name } objects.
const text = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value).trim();
  if (typeof value === "object") {
    const inner = value as { name?: unknown; value?: unknown };
    return text(inner.name ?? inner.value);
  }
  return "";
};

// Reads the date part only, so a timestamp never shifts a day across time zones.
const toDayMonthYear = (value: unknown): string => {
  const raw = text(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : raw;
};

const workflow = defineDurable(
  "add-terminated-hires-to-churn-tracking-sheet",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const employeeId = String(input.id).trim();
    const department = text(input.department);

    const tracked = TRACKED_DEPARTMENTS.some((name) =>
      department.toLowerCase().includes(name.toLowerCase()),
    );
    if (!tracked) {
      return {
        skipped: true,
        reason: "department-not-tracked",
        employeeId,
        department,
      };
    }

    const fullName = [input.first_name, input.last_name]
      .map((part) => part?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
    const terminationDate = toDayMonthYear(input.termination_date);
    const hireDate = toDayMonthYear(input.hire_date);
    const hours = text(input.weekly_working_hours);

    const row = await ctx.step("add-churn-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [NAME_COLUMN]: fullName,
          [TERMINATION_DATE_COLUMN]: terminationDate,
          [HIRE_DATE_COLUMN]: hireDate,
          [DEPARTMENT_COLUMN]: department,
          [HOURS_COLUMN]: hours,
        },
      }),
    );

    const created = row.data?.[0] as { id?: number | string } | undefined;
    return {
      employeeId,
      fullName,
      department,
      terminationDate,
      hireDate,
      hours,
      row: created?.id ?? null,
    };
  },
);

export default workflow;
