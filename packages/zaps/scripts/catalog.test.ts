import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ZAPS_DIR = new URL("..", import.meta.url).pathname;

const isComplex = (zap: string) => existsSync(`${ZAPS_DIR}${zap}/package.json`);
const zaps = readdirSync(ZAPS_DIR, { withFileTypes: true })
  .map((entry) => entry.name)
  .filter(
    (name) => isComplex(name) || existsSync(`${ZAPS_DIR}${name}/workflow.ts`),
  );

// A simple zap has no package.json. zapier.sh and `npx skills add` read its folder as is, so these checks stand in
// for the type and lint gates a complex zap's package.json opts it into, and the fallow gate its .fallowrc.jsonc
// line opts it into.
const simpleZaps = zaps.filter((zap) => !isComplex(zap));
const complexZaps = zaps.filter(isComplex);

const read = (zap: string, file: string) =>
  readFileSync(`${ZAPS_DIR}${zap}/${file}`, "utf8");

// SKILL.md frontmatter is flat `key: value` lines plus one level under `metadata:`.
const frontmatter = (skill: string): Record<string, string> => {
  const block = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? "";
  const fields: Record<string, string> = {};
  let parent = "";
  for (const line of block.split("\n")) {
    const match = /^(\s*)([\w-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, indent = "", key = "", value = ""] = match;
    if (!indent) parent = value ? "" : `${key}.`;
    if (value)
      fields[(indent ? parent : "") + key] = value.replace(/^"(.*)"$/, "$1");
  }
  return fields;
};

// Sample data uses the reserved example domains (example.com, example.org, example.net, .example).
const LEAKS = [
  /[\w.+-]+@(?![\w.-]*\bexample(?:\.(?:com|org|net))?\b)[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\b/i,
  /hooks\.zapier\.com\/hooks\/catch\/\d/,
  /\b1[A-Za-z0-9_-]{40,}\b/,
  /\bC0(?!123456789\b)[A-Z0-9]{8,}\b/,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/,
];

describe.each(simpleZaps)("simple zap %s", (zap) => {
  const files = ["workflow.ts", "SKILL.md", "README.md"].filter((file) =>
    existsSync(`${ZAPS_DIR}${zap}/${file}`),
  );

  it("has a SKILL.md and a README.md next to workflow.ts", () => {
    expect(files).toEqual(["workflow.ts", "SKILL.md", "README.md"]);
  });

  it("uses its folder name as the SKILL.md name and the defineDurable name", () => {
    expect(frontmatter(read(zap, "SKILL.md")).name).toBe(zap);
    expect(read(zap, "workflow.ts")).toMatch(
      new RegExp(`defineDurable(<[^>]*>)?\\(\\s*"${zap}"`),
    );
  });

  it("has the metadata.summary and metadata.apps that zapier.sh lists it by", () => {
    const fields = frontmatter(read(zap, "SKILL.md"));
    expect(fields["metadata.summary"]).toBeTruthy();
    expect(fields["metadata.apps"]).toBeTruthy();
  });

  it("names every connection alias in workflow.ts in SKILL.md", () => {
    const skill = read(zap, "SKILL.md");
    const aliases = [
      ...read(zap, "workflow.ts").matchAll(/connection: "([^"]+)"/g),
    ].map(([, alias]) => alias);
    expect(aliases.filter((alias) => !skill.includes(`\`${alias}\``))).toEqual(
      [],
    );
  });

  it("names apps by slug, never by a CLIAPI implementation key", () => {
    expect(files.filter((file) => read(zap, file).includes("CLIAPI"))).toEqual(
      [],
    );
  });

  it("holds no email address, webhook URL, Google file ID, Slack channel ID or UUID", () => {
    expect(
      files.flatMap((file) =>
        LEAKS.filter((leak) => leak.test(read(zap, file))).map(
          (leak) => `${file}: ${leak.source}`,
        ),
      ),
    ).toEqual([]);
  });
});

// Fallow's ignore globs cannot tell the two kinds apart, so a complex zap opts back in by name.
const fallowOptIns = [
  ...readFileSync(new URL("../../../.fallowrc.jsonc", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n")
    .matchAll(/"!packages\/zaps\/([^/"]+)\/workflow\.ts"/g),
].map(([, zap]) => zap);

describe("fallow", () => {
  it("checks every complex zap and nothing else", () => {
    expect(fallowOptIns.sort()).toEqual(complexZaps.sort());
  });
});
