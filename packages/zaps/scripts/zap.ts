import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

import {
  type Args,
  type DeployConfig,
  type LiveWorkflow,
  type WorkflowEntry,
  describeDiff,
  liveDrift,
  parseArgs,
  parseDeployConfig,
  parseLiveWorkflow,
  parseRuns,
  pins,
  publishArgs,
  sourceDiff,
  statusLines,
  unwrap,
  verifyPublished,
} from "./lib.ts";

const ZAPS_DIR = new URL("..", import.meta.url).pathname;
const REPO_DIR = new URL("../../..", import.meta.url).pathname;

const run = (command: string, args: string[], cwd = REPO_DIR): string => {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["inherit", "pipe", "pipe"],
    });
  } catch (error) {
    const { stdout } = error as { stdout?: string };
    if (stdout?.includes("{")) return stdout;
    throw error;
  }
};

const cli = (args: string[]): unknown =>
  unwrap(
    run("pnpm", [
      "--silent",
      "dlx",
      "@zapier/zapier-sdk-cli",
      "--stability",
      "experimental",
      ...args,
      "--json",
    ]),
  );

const getWorkflow = (id: string): LiveWorkflow =>
  parseLiveWorkflow(cli(["get-workflow", id]));

const readZap = (zap: string) => {
  const dir = `${ZAPS_DIR}${zap}`;
  if (!existsSync(`${dir}/deploy.json`))
    throw new Error(`${zap} has no deploy.json`);
  const config = parseDeployConfig(readFileSync(`${dir}/deploy.json`, "utf8"));
  const files = Object.fromEntries(
    config.files.map((name) => [name, readFileSync(`${dir}/${name}`, "utf8")]),
  );
  const pkg: unknown = JSON.parse(readFileSync(`${dir}/package.json`, "utf8"));
  return { config, files, pin: pins(pkg) };
};

const gitProblems = (): string[] => {
  run("git", ["fetch", "--quiet", "origin", "main"]);
  const git = (...args: string[]) => run("git", args).trim();
  return [
    ...(git("rev-parse", "--abbrev-ref", "HEAD") === "main"
      ? []
      : ["not on main"]),
    ...(git("status", "--porcelain") === ""
      ? []
      : ["working tree has uncommitted changes"]),
    ...(git("rev-parse", "HEAD") === git("rev-parse", "origin/main")
      ? []
      : ["main is not up to date with origin"]),
  ];
};

/** The first call a non-owner cannot make; it also lists open drafts. */
const manageable = (id: string): { ok: boolean; note: string } => {
  try {
    const drafts = cli(["list-workflow-drafts", id]);
    const open = Array.isArray(drafts) ? drafts.length : 0;
    return {
      ok: open === 0,
      note:
        open === 0
          ? "you can manage it"
          : `${open} open draft(s): discard or publish them first`,
    };
  } catch (error) {
    return {
      ok: false,
      note: `you cannot manage it (${(error as Error).message})`,
    };
  }
};

const confirm = async (question: string): Promise<boolean> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "y";
};

const showPlan = (
  live: LiveWorkflow,
  entry: WorkflowEntry,
  config: DeployConfig,
  files: Record<string, string>,
  note: string,
) => {
  const diff = sourceDiff(live.current_version?.source_files ?? {}, files);
  console.log(`\n${live.name} (${entry.id})`);
  console.log(`  ${note}`);
  console.log(`  source: ${describeDiff(diff)}`);
  for (const drift of liveDrift(live, entry, config))
    console.log(`  drift: ${drift}`);
};

const publish = (
  entry: WorkflowEntry,
  zap: ReturnType<typeof readZap>,
): string => {
  const data = cli(publishArgs(entry, zap.config, zap.pin, zap.files)) as {
    id: string;
  };
  return data.id;
};

const publishAndVerify = (
  entry: WorkflowEntry,
  zap: ReturnType<typeof readZap>,
): void => {
  const versionId = publish(entry, zap);
  const problems = verifyPublished(getWorkflow(entry.id), versionId);
  if (problems.length > 0)
    throw new Error(`Published ${versionId}, but ${problems.join("; ")}`);
  console.log(`  published ${versionId}: enabled, trigger active`);
};

const assertCanDeploy = (
  name: string,
  access: { ok: boolean; note: string },
) => {
  if (!access.ok) throw new Error(`Cannot deploy ${name}: ${access.note}`);
};

const approved = async (args: Args, name: string): Promise<boolean> =>
  args.yes || confirm(`Publish to ${name}?`);

const deployOne = async (
  entry: WorkflowEntry,
  zap: ReturnType<typeof readZap>,
  args: Args,
) => {
  const live = getWorkflow(entry.id);
  const access = manageable(entry.id);
  showPlan(live, entry, zap.config, zap.files, access.note);
  if (args.dryRun) return console.log("  dry run: nothing published");
  assertCanDeploy(live.name, access);
  if (!(await approved(args, live.name))) throw new Error("Cancelled");
  publishAndVerify(entry, zap);
};

const checkGit = (dryRun: boolean): void => {
  const problems = gitProblems();
  if (problems.length > 0 && !dryRun)
    throw new Error(`Cannot deploy: ${problems.join("; ")}`);
  for (const problem of problems) console.log(`warning: ${problem}`);
};

const deploy = async (args: Args) => {
  const zap = readZap(args.zap);
  checkGit(args.dryRun);
  for (const entry of zap.config.workflows) await deployOne(entry, zap, args);
};

const status = (args: Args) => {
  for (const entry of readZap(args.zap).config.workflows) {
    const runs = parseRuns(
      cli(["list-workflow-runs", entry.id, "--max-items", "5"]),
    );
    console.log(`\n${statusLines(getWorkflow(entry.id), runs).join("\n")}`);
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "deploy") await deploy(args);
  else status(args);
};

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
