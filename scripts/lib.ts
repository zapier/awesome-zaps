import { z } from "zod";

const paramsSchema = z.record(z.string(), z.unknown());

const triggerSchema = z.object({
  selected_api: z.string().min(1),
  action: z.string().min(1),
  connection: z.string().optional(),
  params: paramsSchema.default({}),
});

const deployConfigSchema = z.object({
  files: z.array(z.string().min(1)).min(1),
  connections: z.record(z.string(), z.string().min(1)),
  workflows: z
    .array(z.object({ id: z.uuid(), trigger: triggerSchema.optional() }))
    .min(1),
});

export type DeployConfig = z.infer<typeof deployConfigSchema>;
export type WorkflowEntry = DeployConfig["workflows"][number];

const liveTriggerSchema = z.object({
  selected_api: z.string(),
  action: z.string(),
  authentication_id: z.string().nullish(),
  params: paramsSchema.nullish(),
  status: z.string(),
  error: z.string().nullish(),
});

const liveWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  triggers: z.array(liveTriggerSchema),
  current_version: z
    .object({
      id: z.string(),
      created_at: z.string(),
      source_files: z.record(z.string(), z.string()),
      connections: z
        .record(z.string(), z.object({ connection_id: z.coerce.string() }))
        .nullish(),
    })
    .nullish(),
});

export type LiveWorkflow = z.infer<typeof liveWorkflowSchema>;

const runSchema = z.object({
  id: z.string(),
  status: z.string(),
  kind: z.string().optional(),
  created_at: z.string(),
  error: z.unknown().optional(),
});

const envelopeSchema = z.object({
  data: z.unknown(),
  errors: z.array(z.object({ message: z.string() })).default([]),
});

const packageSchema = z.object({
  dependencies: z.record(z.string(), z.string()),
});

export type Args = {
  command: "deploy" | "status";
  zap: string;
  dryRun: boolean;
  yes: boolean;
};

export type SourceDiff = {
  changed: string[];
  added: string[];
  removed: string[];
};

const USAGE = "Usage: zap <deploy|status> <zap-folder> [--dry-run] [--yes]";

const FLAGS = ["--dry-run", "--yes"];

const isCommand = (value: string | undefined): value is Args["command"] =>
  value === "deploy" || value === "status";

export const parseArgs = (argv: string[]): Args => {
  const [command, zap, ...flags] = argv;
  if (!isCommand(command) || !zap) throw new Error(USAGE);
  const unknown = flags.filter((flag) => !FLAGS.includes(flag));
  if (unknown.length > 0)
    throw new Error(`Unknown flag ${unknown.join(", ")}. ${USAGE}`);
  return {
    command,
    zap,
    dryRun: flags.includes("--dry-run"),
    yes: flags.includes("--yes"),
  };
};

const undeclaredAliases = (config: DeployConfig): string[] =>
  config.workflows.flatMap(({ trigger }) =>
    trigger?.connection && !(trigger.connection in config.connections)
      ? [trigger.connection]
      : [],
  );

export const parseDeployConfig = (raw: string): DeployConfig => {
  const config = deployConfigSchema.parse(JSON.parse(raw));
  const missing = undeclaredAliases(config);
  if (missing.length > 0) {
    throw new Error(
      `deploy.json uses connection(s) it does not declare: ${missing.join(", ")}`,
    );
  }
  return config;
};

/** The CLI prints a JSON envelope, sometimes after warning lines. */
export const unwrap = (output: string): unknown => {
  const start = output.indexOf("{");
  if (start < 0)
    throw new Error(`No JSON in CLI output: ${output.slice(0, 200)}`);
  const { data, errors } = envelopeSchema.parse(
    JSON.parse(output.slice(start)),
  );
  if (errors.length > 0)
    throw new Error(errors.map((e) => e.message).join("; "));
  return data;
};

export const parseLiveWorkflow = (data: unknown): LiveWorkflow =>
  liveWorkflowSchema.parse(data);

export const parseRuns = (data: unknown) => z.array(runSchema).parse(data);

/** Everything but durable goes to --dependencies; durable has its own flag. */
export const pins = (pkg: unknown) => {
  const { dependencies } = packageSchema.parse(pkg);
  const { "@zapier/zapier-durable": durable, ...rest } = dependencies;
  if (!durable)
    throw new Error("package.json does not pin @zapier/zapier-durable");
  return { dependencies: rest, durable };
};

const connectionsArg = (connections: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(connections).map(([alias, connectionId]) => [
      alias,
      { connectionId },
    ]),
  );

const triggerArg = (
  trigger: NonNullable<WorkflowEntry["trigger"]>,
  connections: Record<string, string>,
) => ({
  selected_api: trigger.selected_api,
  action: trigger.action,
  authentication_id: trigger.connection
    ? (connections[trigger.connection] ?? null)
    : null,
  params: trigger.params,
});

export const publishArgs = (
  entry: WorkflowEntry,
  config: DeployConfig,
  pin: ReturnType<typeof pins>,
  sourceFiles: Record<string, string>,
): string[] => [
  "publish-workflow-version",
  entry.id,
  JSON.stringify(sourceFiles),
  "--dependencies",
  JSON.stringify(pin.dependencies),
  "--zapier-durable-version",
  pin.durable,
  "--connections",
  JSON.stringify(connectionsArg(config.connections)),
  ...(entry.trigger
    ? [
        "--trigger",
        JSON.stringify(triggerArg(entry.trigger, config.connections)),
      ]
    : ["--manual"]),
  "--enabled",
];

export const sourceDiff = (
  deployed: Record<string, string>,
  local: Record<string, string>,
): SourceDiff => ({
  changed: Object.keys(local).filter(
    (name) => name in deployed && deployed[name] !== local[name],
  ),
  added: Object.keys(local).filter((name) => !(name in deployed)),
  removed: Object.keys(deployed).filter((name) => !(name in local)),
});

const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, nested: unknown) =>
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? Object.fromEntries(
          Object.entries(nested).sort(([a], [b]) => a.localeCompare(b)),
        )
      : nested,
  );

const connectionDrift = (
  live: LiveWorkflow,
  declared: Record<string, string>,
): string[] =>
  Object.entries(declared).flatMap(([alias, id]) =>
    live.current_version?.connections?.[alias]?.connection_id === id
      ? []
      : [
          `connection "${alias}" is bound to a different connection than deploy.json declares`,
        ],
  );

type TriggerShape = {
  selected_api: string;
  action: string;
  params?: Record<string, unknown> | null;
};

const triggerKey = (trigger?: TriggerShape): string =>
  trigger
    ? stable({
        selected_api: trigger.selected_api,
        action: trigger.action,
        params: trigger.params ?? {},
      })
    : "none";

const triggerDrift = (live: LiveWorkflow, entry: WorkflowEntry): string[] =>
  triggerKey(live.triggers[0]) === triggerKey(entry.trigger)
    ? []
    : ["the live trigger differs from deploy.json"];

/** Differences between what is live and what deploy.json declares. */
export const liveDrift = (
  live: LiveWorkflow,
  entry: WorkflowEntry,
  config: DeployConfig,
): string[] => [
  ...connectionDrift(live, config.connections),
  ...triggerDrift(live, entry),
];

/** Problems with a workflow right after publishing; empty when it took. */
export const verifyPublished = (
  live: LiveWorkflow,
  publishedVersionId: string,
): string[] => [
  ...(live.enabled ? [] : ["the workflow is not enabled"]),
  ...live.triggers
    .filter((trigger) => trigger.status !== "active" || trigger.error)
    .map(
      (trigger) =>
        `trigger ${trigger.action} is ${trigger.status}${trigger.error ? `: ${trigger.error}` : ""}`,
    ),
  ...(live.current_version?.id === publishedVersionId
    ? []
    : ["the published version is not the current version"]),
];

export const describeDiff = ({
  changed,
  added,
  removed,
}: SourceDiff): string =>
  changed.length + added.length + removed.length === 0
    ? "deployed source already matches the repo"
    : [
        ...changed.map((name) => `changed ${name}`),
        ...added.map((name) => `new ${name}`),
        ...removed.map((name) => `removed ${name}`),
      ].join(", ");

type Run = ReturnType<typeof parseRuns>[number];

const runLine = (run: Run): string =>
  `${run.created_at}  ${run.status}${run.error ? " (error)" : ""}  ${run.kind ?? ""}  ${run.id}`.trimEnd();

const triggerSummary = (trigger: LiveWorkflow["triggers"][number]): string =>
  `${trigger.action} ${trigger.status}${trigger.error ? ` (${trigger.error})` : ""}`;

const triggersText = (triggers: LiveWorkflow["triggers"]): string =>
  triggers.map(triggerSummary).join(", ") || "none";

const versionText = (version: LiveWorkflow["current_version"]): string =>
  version
    ? `${version.id}  published ${version.created_at}`
    : "none  published never";

export const statusLines = (live: LiveWorkflow, runs: Run[]): string[] => [
  `${live.name} (${live.id})`,
  `  enabled: ${live.enabled}  triggers: ${triggersText(live.triggers)}`,
  `  version: ${versionText(live.current_version)}`,
  ...runs.map((run) => `  ${runLine(run)}`),
];
