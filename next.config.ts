import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as { version: string };

const dev = process.env.NODE_ENV !== "production";

const base = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // blob: لازمٌ لمعاينة صورةٍ يختارها المستخدم من جهازه — العنوانُ يُنشئه سكربتُنا
  // وهو من أصلنا وحدَه ولا يشير إلى الشبكة، فلا يوسّع السطحَ المكشوف.
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const csp = [...base, "frame-ancestors 'none'"].join("; ");

/**
 * مسارُ التضمين وحدَه يُؤطَّر. وهو مقصورٌ على ذلك بثلاثة قيود:
 * صفحاتُه بلا جلسةٍ ولا فعلٍ يغيّر شيئاً، وبلا فهرسةٍ (robots)،
 * والكعكاتُ SameSite=Lax فلا تُرسَل أصلاً في إطارٍ من أصلٍ آخر.
 * فلم يبقَ في التأطير فعلٌ موثَّقٌ يُخدَع المستخدمُ بالنقر عليه.
 */
const embedCsp = [...base, "frame-ancestors *"].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "@node-rs/argon2"],
  env: { APP_VERSION: pkg.version },
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      {
        // كلُّ شيءٍ عدا /embed. والاستثناءُ بالنفي لا بترتيب القواعد: ترويستا CSP
        // معاً تُطبَّقان بالتقاطع، فالمسموحُ في إحداهما يبقى ممنوعاً بالأخرى.
        source: "/((?!embed/).*)",
        headers: [
          ...common,
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          ...common,
          { key: "Content-Security-Policy", value: embedCsp },
        ],
      },
    ];
  },
};

export default nextConfig;
