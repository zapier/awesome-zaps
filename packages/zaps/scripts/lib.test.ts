import { describe, expect, it } from "vitest";

import {
  type DeployConfig,
  type LiveWorkflow,
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

const ID = "01a17e06-790e-7fc3-971c-89350c7b02ca";
const OTHER_ID = "01a17e0c-4ac6-73b0-a9b0-51bd9f5236fe";

const config: DeployConfig = {
  files: ["workflow.ts", "logic.ts"],
  connections: { slack: "conn-slack", sheets: "conn-sheets" },
  workflows: [
    {
      id: ID,
      trigger: {
        selected_api: "ScheduleCLIAPI@1.7.0",
        action: "everyWeek",
        params: { hod: "9:00 AM", dow: ["0", "1"] },
      },
    },
    {
      id: OTHER_ID,
      trigger: {
        selected_api: "SlackCLIAPI@1.44.0",
        action: "new_reaction_added_v3",
        connection: "slack",
        params: { emoji: "refresh" },
      },
    },
  ],
};

const entry = (index: number) => {
  const workflow = config.workflows[index];
  if (!workflow) throw new Error("missing fixture");
  return workflow;
};

const live = (overrides: Partial<LiveWorkflow> = {}): LiveWorkflow => ({
  id: ID,
  name: "Digest",
  enabled: true,
  triggers: [
    {
      selected_api: "ScheduleCLIAPI@1.7.0",
      action: "everyWeek",
      authentication_id: null,
      params: { dow: ["0", "1"], hod: "9:00 AM" },
      status: "active",
      error: null,
    },
  ],
  current_version: {
    id: "v1",
    created_at: "2026-10-27T16:00:00Z",
    source_files: { "workflow.ts": "a" },
    connections: {
      slack: { connection_id: "conn-slack" },
      sheets: { connection_id: "conn-sheets" },
    },
  },
  ...overrides,
});

describe("parseArgs", () => {
  it("reads the command, the zap, and both flags", () => {
    expect(parseArgs(["deploy", "my-zap", "--dry-run", "--yes"])).toEqual({
      command: "deploy",
      zap: "my-zap",
      dryRun: true,
      yes: true,
    });
  });

  it("defaults both flags to false", () => {
    expect(parseArgs(["status", "my-zap"])).toMatchObject({
      dryRun: false,
      yes: false,
    });
  });

  it("rejects an unknown command, a missing zap, and an unknown flag", () => {
    expect(() => parseArgs(["ship", "my-zap"])).toThrow("Usage");
    expect(() => parseArgs(["deploy"])).toThrow("Usage");
    expect(() => parseArgs(["deploy", "my-zap", "--force"])).toThrow(
      "Unknown flag --force",
    );
  });
});

describe("parseDeployConfig", () => {
  it("accepts a valid config and defaults trigger params to empty", () => {
    const parsed = parseDeployConfig(
      JSON.stringify({
        files: ["workflow.ts"],
        connections: {},
        workflows: [{ id: ID, trigger: { selected_api: "A@1", action: "go" } }],
      }),
    );
    expect(parsed.workflows[0]?.trigger?.params).toEqual({});
  });

  it("rejects a trigger that names an undeclared connection", () => {
    const raw = JSON.stringify({
      files: ["workflow.ts"],
      connections: { slack: "c" },
      workflows: [
        {
          id: ID,
          trigger: { selected_api: "A@1", action: "go", connection: "sheets" },
        },
      ],
    });
    expect(() => parseDeployConfig(raw)).toThrow("does not declare: sheets");
  });

  it("rejects a workflow id that is not a uuid and an empty file list", () => {
    const base = {
      files: ["workflow.ts"],
      connections: {},
      workflows: [{ id: "nope" }],
    };
    expect(() => parseDeployConfig(JSON.stringify(base))).toThrow();
    expect(() =>
      parseDeployConfig(
        JSON.stringify({ ...base, files: [], workflows: [{ id: ID }] }),
      ),
    ).toThrow();
  });
});

describe("unwrap", () => {
  it("returns data from an envelope that follows warning lines", () => {
    expect(
      unwrap('warning: experimental\n{"data":{"id":"x"},"errors":[]}'),
    ).toEqual({ id: "x" });
  });

  it("throws the CLI's error messages", () => {
    const output =
      '{"data":null,"errors":[{"message":"no access"},{"message":"nope"}]}';
    expect(() => unwrap(output)).toThrow("no access; nope");
  });

  it("throws when the output has no JSON", () => {
    expect(() => unwrap("command not found")).toThrow("No JSON in CLI output");
  });
});

describe("pins", () => {
  it("separates the durable version from the other dependencies", () => {
    expect(
      pins({
        dependencies: {
          "@zapier/zapier-durable": "0.14.3",
          "@zapier/zapier-sdk": "0.117.0",
          zod: "4.6.7",
        },
      }),
    ).toEqual({
      dependencies: { "@zapier/zapier-sdk": "0.117.0", zod: "4.6.7" },
      durable: "0.14.3",
    });
  });

  it("throws when the durable version is not pinned", () => {
    expect(() => pins({ dependencies: { zod: "4.6.7" } })).toThrow(
      "does not pin @zapier/zapier-durable",
    );
  });
});

describe("publishArgs", () => {
  const pin = { dependencies: { zod: "4.6.7" }, durable: "0.14.3" };
  const files = { "workflow.ts": "a" };

  it("passes the source, pinned versions, connections, and enables the workflow", () => {
    const args = publishArgs(entry(0), config, pin, files);
    expect(args.slice(0, 3)).toEqual([
      "publish-workflow-version",
      ID,
      JSON.stringify(files),
    ]);
    expect(args[args.indexOf("--dependencies") + 1]).toBe('{"zod":"4.6.7"}');
    expect(args[args.indexOf("--zapier-durable-version") + 1]).toBe("0.14.3");
    expect(JSON.parse(args[args.indexOf("--connections") + 1] ?? "")).toEqual({
      slack: { connectionId: "conn-slack" },
      sheets: { connectionId: "conn-sheets" },
    });
    expect(args).toContain("--enabled");
  });

  it("gives a no-auth trigger a null authentication id", () => {
    const args = publishArgs(entry(0), config, pin, files);
    expect(JSON.parse(args[args.indexOf("--trigger") + 1] ?? "")).toEqual({
      selected_api: "ScheduleCLIAPI@1.7.0",
      action: "everyWeek",
      authentication_id: null,
      params: { hod: "9:00 AM", dow: ["0", "1"] },
    });
  });

  it("resolves a trigger's connection alias to its connection id", () => {
    const args = publishArgs(entry(1), config, pin, files);
    const trigger = JSON.parse(args[args.indexOf("--trigger") + 1] ?? "") as {
      authentication_id: string;
    };
    expect(trigger.authentication_id).toBe("conn-slack");
  });

  it("publishes a workflow without a trigger as manual", () => {
    const args = publishArgs({ id: ID }, config, pin, files);
    expect(args).toContain("--manual");
    expect(args).not.toContain("--trigger");
  });
});

describe("sourceDiff and describeDiff", () => {
  it("lists changed, new, and removed files", () => {
    const diff = sourceDiff(
      { "a.ts": "1", "b.ts": "1", "c.ts": "1" },
      { "a.ts": "1", "b.ts": "2", "d.ts": "1" },
    );
    expect(diff).toEqual({
      changed: ["b.ts"],
      added: ["d.ts"],
      removed: ["c.ts"],
    });
    expect(describeDiff(diff)).toBe("changed b.ts, new d.ts, removed c.ts");
  });

  it("says when the deployed source already matches", () => {
    expect(describeDiff(sourceDiff({ "a.ts": "1" }, { "a.ts": "1" }))).toBe(
      "deployed source already matches the repo",
    );
  });
});

describe("liveDrift", () => {
  it("reports nothing when the live workflow matches, whatever the param key order", () => {
    expect(liveDrift(live(), entry(0), config)).toEqual([]);
  });

  it("reports a connection bound to something other than deploy.json declares", () => {
    const drifted = live({
      current_version: {
        id: "v1",
        created_at: "x",
        source_files: {},
        connections: {
          slack: { connection_id: "someone-else" },
          sheets: { connection_id: "conn-sheets" },
        },
      },
    });
    expect(liveDrift(drifted, entry(0), config)).toEqual([
      'connection "slack" is bound to a different connection than deploy.json declares',
    ]);
  });

  it("reports a live trigger whose settings differ", () => {
    const [trigger] = live().triggers;
    if (!trigger) throw new Error("missing fixture");
    const drifted = live({
      triggers: [{ ...trigger, params: { hod: "8:00 AM", dow: ["0", "1"] } }],
    });
    expect(liveDrift(drifted, entry(0), config)).toEqual([
      "the live trigger differs from deploy.json",
    ]);
  });

  it("reports a missing live trigger and an undeclared one", () => {
    const message = ["the live trigger differs from deploy.json"];
    expect(liveDrift(live({ triggers: [] }), entry(0), config)).toEqual(
      message,
    );
    expect(liveDrift(live(), { id: ID }, config)).toEqual(message);
  });
});

describe("verifyPublished", () => {
  it("passes when enabled, the trigger is active, and the version is current", () => {
    expect(verifyPublished(live(), "v1")).toEqual([]);
  });

  it("reports a disabled workflow", () => {
    expect(verifyPublished(live({ enabled: false }), "v1")).toEqual([
      "the workflow is not enabled",
    ]);
  });

  it("reports a trigger that is not active, with its error", () => {
    const [trigger] = live().triggers;
    if (!trigger) throw new Error("missing fixture");
    const failed = live({
      triggers: [{ ...trigger, status: "failed", error: "bad channel" }],
    });
    expect(verifyPublished(failed, "v1")).toEqual([
      "trigger everyWeek is failed: bad channel",
    ]);
  });

  it("reports a published version that is not the current one", () => {
    expect(verifyPublished(live(), "v2")).toEqual([
      "the published version is not the current version",
    ]);
  });
});

describe("parseLiveWorkflow and runs", () => {
  it("accepts numeric connection ids from older connections", () => {
    const parsed = parseLiveWorkflow({
      ...live(),
      current_version: {
        id: "v",
        created_at: "x",
        source_files: {},
        connections: { sheets: { connection_id: 12345678 } },
      },
    });
    expect(parsed.current_version?.connections?.sheets?.connection_id).toBe(
      "12345678",
    );
  });

  it("summarizes a workflow with its triggers, version, and runs, marking a run with an error", () => {
    const runs = parseRuns([
      {
        id: "r1",
        status: "finished",
        kind: "live",
        created_at: "t1",
        error: null,
      },
      {
        id: "r2",
        status: "failed",
        created_at: "t2",
        error: { message: "boom" },
      },
    ]);
    expect(statusLines(live(), runs)).toEqual([
      `Digest (${ID})`,
      "  enabled: true  triggers: everyWeek active",
      "  version: v1  published 2026-10-27T16:00:00Z",
      "  t1  finished  live  r1",
      "  t2  failed (error)    r2",
    ]);
  });

  it("says none when a workflow has no triggers or version", () => {
    const bare = live({ triggers: [], current_version: null });
    expect(statusLines(bare, []).slice(1)).toEqual([
      "  enabled: true  triggers: none",
      "  version: none  published never",
    ]);
  });
});
