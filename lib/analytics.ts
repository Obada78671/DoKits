import "server-only";
import { db } from "@/lib/db";

/**
 * تحليلاتٌ **مجمَّعةٌ فقط**: عدّادٌ لكلّ أداة، ولا شيءَ غيرُه.
 *
 * لا معرّفَ مستخدم، ولا عنوانَ IP، ولا كوكي، ولا طابعَ زمنيٍّ لكلّ حدث — فلا
 * يمكن استخلاصُ سلوك فردٍ من هذه الأرقام، ولذلك لا تحتاج موافقةً. والطبقةُ
 * مستقلّةٌ: `ANALYTICS=off` يعطّلها كلَّها بلا لمسِ صفحةٍ واحدة.
 */

export type AnalyticsEvent = "view" | "search";

const enabled = process.env.ANALYTICS !== "off";

export interface AnalyticsSink {
  record(event: AnalyticsEvent, slug: string): void;
}

/** المصرفُ الافتراضيّ: عدّاداتٌ في SQLite */
class CounterSink implements AnalyticsSink {
  record(event: AnalyticsEvent, slug: string) {
    const column = event === "view" ? "views" : "searches";
    db()
      .prepare(
        `INSERT INTO tool_stats (tool_slug, ${column}) VALUES (?, 1)
         ON CONFLICT(tool_slug) DO UPDATE SET ${column} = ${column} + 1`,
      )
      .run(slug);
  }
}

class NullSink implements AnalyticsSink {
  record() { /* معطَّلة */ }
}

let sink: AnalyticsSink = enabled ? new CounterSink() : new NullSink();

/** لاستبدال المصرف مستقبلاً (خادمُ تحليلاتٍ ذاتيُّ الاستضافة مثلاً) */
export function setAnalyticsSink(s: AnalyticsSink) { sink = s; }

export function track(event: AnalyticsEvent, slug: string): void {
  try { sink.record(event, slug); } catch { /* التحليلاتُ لا تُسقط طلباً أبداً */ }
}
