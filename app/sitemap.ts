import type { MetadataRoute } from "next";
import { CATEGORIES, TOOLS, isIndexable, publishedTools, summarizeAll } from "@/tools";
import { WORKFLOWS } from "@/tools/tasks";

const BASE = process.env.SITE_URL ?? "https://dokits.net";

/** الخريطةُ تُشتقّ من السجلّ — أداةٌ جديدةٌ تدخلها بلا تعديل */
export default function sitemap(): MetadataRoute.Sitemap {
  const live = publishedTools(summarizeAll(TOOLS));
  const now = new Date();

  const indexable = live.filter(isIndexable);

  /** وسمُ hreflang يقترن بكلّ صفحةٍ لها نظيرٌ في اللغة الأخرى، ويشير كلٌّ منهما إلى الآخر */
  const tools = indexable.map((t) => ({
    url: `${BASE}${t.seo.canonicalPath}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    ...(t.langs.includes("en")
      ? { alternates: { languages: { ar: `${BASE}${t.route}`, en: `${BASE}/en${t.route}` } } }
      : {}),
  }));

  const enTools = indexable.filter((t) => t.langs.includes("en")).map((t) => ({
    url: `${BASE}/en${t.route}`,
    lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    alternates: { languages: { ar: `${BASE}${t.route}`, en: `${BASE}/en${t.route}` } },
  }));

  const enHome = [{
    url: `${BASE}/en`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: { languages: { ar: BASE, en: `${BASE}/en` } },
  }];

  const categories = CATEGORIES.flatMap((c) => {
    const inCat = live.filter((t) => t.categoryId === c.id);
    if (inCat.length === 0) return [];
    const subs = c.subcategories
      .filter((s) => inCat.some((t) => t.subcategoryId === s.id))
      .map((s) => ({
        url: `${BASE}/category/${c.id}/${s.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    return [
      { url: `${BASE}/category/${c.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
      ...subs,
    ];
  });

  return [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...WORKFLOWS.map((w) => ({
      url: `${BASE}/workflows/${w.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...categories,
    ...tools,
    ...enHome,
    ...enTools,
  ];
}
