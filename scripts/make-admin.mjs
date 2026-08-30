// ترقية مستخدم موجود إلى مدير — يُشغَّل بيد المشغّل على الخادم: node scripts/make-admin.mjs <username>
import Database from "better-sqlite3";
import path from "node:path";

const username = process.argv[2];
if (!username) {
  console.error("الاستعمال: node scripts/make-admin.mjs <username>");
  process.exit(1);
}

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "dokits.db");
const db = new Database(DB_PATH);
const info = db.prepare("UPDATE users SET role = 'admin' WHERE username = ?").run(username);
console.log(info.changes === 1 ? `صار «${username}» مديراً.` : `لا مستخدم باسم «${username}».`);
