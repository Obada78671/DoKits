/**
 * يحلّ اختصارَ المسار `@/` كما يفعل الحزّامُ في التطبيق — كي تعمل الاختباراتُ
 * على مُشغِّل node المدمج بلا أيّ حزمةٍ إضافيّة.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = path.join(ROOT, specifier.slice(2));
    for (const cand of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        return next(pathToFileURL(cand).href, context);
      }
    }
  }
  return next(specifier, context);
}
