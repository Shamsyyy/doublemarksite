import { execFileSync } from "node:child_process";

const patterns = [
  "service_role",
  "SUPABASE_SERVICE_ROLE",
  "password\\s*=",
  "secret\\s*=",
  "token\\s*=",
  "api_key",
  "private_key",
  "sk_[A-Za-z0-9]",
  "ghp_[A-Za-z0-9]",
  "eyJ[A-Za-z0-9_-]+",
];

const allowList = [
  ".env.example",
  "scripts/check-secrets.js",
  "src/pages/UpdatePasswordPage.tsx",
  "src/test/setup.ts",
];

function runGitGrep() {
  try {
    return execFileSync(
      "git",
      [
        "grep",
        "-I",
        "-n",
        "-E",
        patterns.join("|"),
        "--",
        ".",
        ":!package-lock.json",
        ":!node_modules",
        ":!dist",
      ],
      { encoding: "utf8" },
    );
  } catch (error) {
    if (error.status === 1) {
      return "";
    }
    throw error;
  }
}

const matches = runGitGrep()
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => !allowList.some((allowed) => line.includes(allowed)));

if (matches.length > 0) {
  console.error("Potential secrets found:");
  for (const match of matches) {
    console.error(match);
  }
  process.exit(1);
}

console.log("No obvious secret patterns found in tracked files.");
