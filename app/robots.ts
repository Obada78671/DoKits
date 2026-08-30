import type { MetadataRoute } from "next";

const BASE = process.env.SITE_URL ?? "https://dokits.net";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      // صفحاتٌ خاصّةٌ بالمستخدم أو بلا قيمةٍ للفهرسة
      disallow: ["/my", "/account", "/admin/", "/search", "/login", "/register"],
    }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
