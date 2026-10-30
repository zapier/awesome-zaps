import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

const sdk = createZapierSdk();

// HR system endpoint that creates the training record (Webhooks by Zapier POST target).
const HR_WEBHOOK_URL = "YOUR_HR_WEBHOOK_URL";
// Form question titles, as they appear in the Google Form. Match these to your form's questions.
const FORM_FIELDS = {
  employeeId: "Employee ID",
  courseName: "Course name",
  completedDate: "Completion date",
  provider: "Training provider",
  status: "Status",
};

const AnswersSchema = z.record(z.string(), z.unknown());

function normalizeInput(rawInput: unknown): unknown {
  if (typeof rawInput === "string") {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

// Formats a completion date as DD/MM/YYYY. ISO dates (YYYY-MM-DD, as Google Forms sends
// date answers) are rearranged directly; anything else is parsed and read in UTC.
function formatTrainingDate(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${parsed.getUTCFullYear()}`;
}

const workflow = defineDurable<unknown, unknown>(
  "add-completed-training-from-form-to-hr-record",
  async (ctx, rawInput) => {
    const answers = AnswersSchema.parse(normalizeInput(rawInput));

    const employeeId = text(answers[FORM_FIELDS.employeeId]);
    if (!employeeId) {
      return { skipped: true, reason: "missing-employee-id" };
    }

    const trainingDate = formatTrainingDate(
      text(answers[FORM_FIELDS.completedDate]),
    );
    const record = {
      employee_id: employeeId,
      training_type: text(answers[FORM_FIELDS.courseName]),
      training_date: trainingDate,
      provider: text(answers[FORM_FIELDS.provider]),
      status: text(answers[FORM_FIELDS.status]),
    };

    const created = await ctx.step("create-hr-training-record", async () =>
      sdk.runAction({
        appKey: "webhook",
        actionType: "write",
        actionKey: "post",
        inputs: {
          url: HR_WEBHOOK_URL,
          payload_type: "json",
          data: record,
          extract_variables: "no",
        },
      }),
    );

    return { employeeId, trainingDate, created: created.data[0] ?? null };
  },
);

export default workflow;
