// Writes the last commit date to public/changelog.json for the footer stamp.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

let latestCommitDate = null;
try {
  latestCommitDate = execSync("git log -1 --format=%cd --date=format:%m-%d-%y", {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim() || null;
} catch {
  // Not a git checkout yet; the footer falls back to "..."
}

writeFileSync("public/changelog.json", JSON.stringify({ latestCommitDate }) + "\n");
console.log(`Generated public/changelog.json (${latestCommitDate ?? "no commits"})`);
