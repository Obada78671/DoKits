// رفع الإصدار (SemVer) — يُشغَّل مع كلّ تغيير قابل للشحن: node scripts/version.mjs [patch|minor|major]
import fs from "node:fs";

const kind = process.argv[2] ?? "patch";
if (!["patch", "minor", "major"].includes(kind)) {
  console.error("الاستعمال: node scripts/version.mjs [patch|minor|major]");
  process.exit(1);
}

const path = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
const [maj, min, pat] = pkg.version.split(".").map(Number);
const next =
  kind === "major" ? `${maj + 1}.0.0` :
  kind === "minor" ? `${maj}.${min + 1}.0` :
  `${maj}.${min}.${pat + 1}`;

pkg.version = next;
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log(`v${[maj, min, pat].join(".")} → v${next}`);
