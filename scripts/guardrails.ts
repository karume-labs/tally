// Mechanical guardrails from .agents/rules/, applied to src/ so the rules and
// the code cannot drift silently. Advisory by default; --strict exits non-zero
// for pre-commit or CI.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const MAX_LINES = 150;

// Generated shadcn primitives and drizzle migrations are not ours to edit.
const IGNORED_DIRS = ["src/components/ui", "src/db/migrations"];

interface Rule {
  id: string;
  pattern: RegExp;
  message: string;
}

interface Violation {
  file: string;
  line: number;
  rule: string;
  message: string;
}

const LINE_RULES: Rule[] = [
  {
    // `export default function` is left alone: it is what every expo-router
    // route file uses, and default exports are allowed there.
    id: "arrow-functions",
    pattern: /^\s*(?:export\s+)?(?:async\s+)?function\s+\w+\s*[(<]/,
    message: "use an arrow function with a named export",
  },
  {
    // Asset requires are exempt: those files live outside src/ and cannot be
    // reached through the alias.
    id: "parent-imports",
    pattern:
      /(?:from|require\(|import\()\s*["']\.\.\/(?![^"']*\.(?:png|jpe?g|gif|webp|svg|mp4|ttf|otf)["'])/,
    message: "import through the @/ alias instead of ../",
  },
  {
    id: "unsafe-casts",
    pattern: /\bas\s+unknown\s+as\b|\bas\s+any\b/,
    message: "an unsafe cast hides a type the schema should guarantee",
  },
  {
    id: "emoji",
    pattern: /\p{Extended_Pictographic}/u,
    message: "no emojis in UI copy",
  },
];

const isIgnored = (file: string): boolean =>
  IGNORED_DIRS.some((dir) => file.startsWith(path.join(ROOT, dir)));

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (isIgnored(full)) return [];
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

const scanFile = (file: string) => {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split("\n");
  const lineCount = source.replace(/\n$/, "").split("\n").length;
  const violations: Violation[] = [];
  const warnings: Violation[] = [];

  for (const [index, line] of lines.entries()) {
    for (const rule of LINE_RULES) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: path.relative(ROOT, file),
          line: index + 1,
          rule: rule.id,
          message: rule.message,
        });
      }
    }
  }

  if (lineCount > MAX_LINES) {
    warnings.push({
      file: path.relative(ROOT, file),
      line: MAX_LINES + 1,
      rule: "file-length",
      message: `${lineCount} lines, cap is ${MAX_LINES}`,
    });
  }

  return { violations, warnings };
};

const print = (label: string, rows: Violation[]): void => {
  for (const row of rows) {
    console.log(
      `${label} ${row.file}:${row.line}  ${row.rule} — ${row.message}`,
    );
  }
};

const main = (): void => {
  const strict = process.argv.includes("--strict");
  const files = walk(SRC);

  const violations: Violation[] = [];
  const warnings: Violation[] = [];
  for (const file of files) {
    const result = scanFile(file);
    violations.push(...result.violations);
    warnings.push(...result.warnings);
  }

  if (violations.length === 0) {
    console.log(`Guardrails OK — ${files.length} files checked.`);
  } else {
    print("error", violations);
    console.log(
      `\n${violations.length} violation(s) across ${files.length} files checked.`,
    );
  }

  // File length is reported but does not fail: the repo still has files over
  // the cap, and blocking every commit on debt that predates the checker is how
  // a checker gets deleted.
  if (warnings.length > 0) {
    console.log("");
    print("warn ", warnings);
  }

  if (strict && violations.length > 0) process.exit(1);
};

main();
