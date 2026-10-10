// Tally ships its guardrails in-tree at .agents/rules/.
// There is no external guardrails checkout to sync from; to update a rule,
// edit the file directly here.

const fs = require("node:fs");
const path = require("node:path");

const AGENTS_DIR = path.resolve(process.cwd(), ".agents");
const RULES_DIR = path.resolve(AGENTS_DIR, "rules");

function listRuleFiles(): string[] {
  const names: string[] = fs.readdirSync(RULES_DIR);
  return names
    .filter(
      (name: string): name is string & { endsWith: () => boolean } =>
        typeof name === "string" && name.endsWith(".md"),
    )
    .map((name: string): string => path.join(RULES_DIR, name));
}

function main(): void {
  const args: string[] = process.argv.slice(2);
  const check: boolean = args.includes("--check");

  if (check) {
    const files: string[] = listRuleFiles();
    if (files.length === 0) {
      console.error("No guardrail rule files found in .agents/rules/");
      process.exit(1);
    }
    console.log(`Guardrail mirror OK (${files.length} rule files)`);
    return;
  }

  console.log(
    "Tally already ships its guardrails in-tree at .agents/rules/. " +
      "There is no external guardrails checkout to sync from; to update a rule, " +
      "edit the file directly here.",
  );
}

main();
