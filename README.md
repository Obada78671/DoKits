# Do Kits 🧰

**حقيبةُ أدواتِ عملٍ عربيّة — أدواتٌ متفرّقة، هويّةٌ واحدة.** تعمل على dokits.net من خادم البيت.

- ‏Next.js (App Router) + SQLite (better-sqlite3) — حاويةٌ واحدةٌ خفيفة، لا خدمات خارجيّة.
- مصادقةٌ ذاتيّة: argon2id + جلسات مخزّنة ببصمة sha256 + حدّ معدّلٍ في الذاكرة (لا تسجيل IP).
- ‏RTL أوّلاً، فاتح/داكن، خطوط IBM Plex مستضافة ذاتيّاً.

## التطوير

```bash
npm install
npm run dev        # http://localhost:3902
```

القاعدة تُنشأ وتُهاجَر وتُبذَر تلقائيّاً في `data/` عند أوّل طلب.

**ترقيةُ مدير** — في التطوير على جهازك:

```bash
node scripts/make-admin.mjs <username>
```

وعلى الخادم (السكربت داخل الصورة، و`DB_PATH` مضبوطٌ فيها):

```bash
docker exec dokits node scripts/make-admin.mjs <username>
```

الترقيةُ تسري فوراً بلا إعادة دخول — الدورُ يُقرأ من القاعدة مع كلّ طلب.

## الهويّة والرموز

رموز التصميم (`--dk-`) في [app/globals.css](app/globals.css) — مصدرها وثيقة الهويّة المعتمدة (artifact «هويّة Do Kits»). القاعدة الذهبيّة: **الكهرمان لما هو فاعلٌ أو مختارٌ فقط**، والبتروليّ للبنية. لا ألوان صلبة في أيّ مكوّن.

## إضافة أداة

كلّ أداة مجلّد `tools/<slug>/` + بيان تعريف في [tools/index.ts](tools/index.ts). دمجُ أيّ أداةٍ خارجيّةٍ يخضع لعقد التطبيع الجامع — وثيقته قادمة في `docs/normalization-contract.md` مع أوّل أداة نموذجيّة.

## الإصدار

رفعٌ تلقائيّ مع كلّ تغييرٍ قابلٍ للشحن:

```bash
npm run version:patch   # أو version:minor / version:major
```

## النشر (خادم البيت)

```bash
bash /mnt/user/personal/projects/dokits/deploy/deploy.sh
```

يسحب ويبني (بسقف ذاكرة) ويشغّل compose بنمط docker:cli على `127.0.0.1:3900`، ثمّ يفحص `/api/health` بالمحتوى. العامّ حصراً عبر نفق cloudflared. الأسرار في `/mnt/user/appdata/dokits/.env` (تولَّد على الخادم ولا تدخل المستودع).
