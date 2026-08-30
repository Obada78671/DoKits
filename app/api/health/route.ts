import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    dbOk = db().prepare("SELECT 1 x").get() !== undefined;
  } catch {
    dbOk = false;
  }
  return Response.json(
    { ok: dbOk, app: "dokits", version: process.env.APP_VERSION ?? "dev" },
    { status: dbOk ? 200 : 500 },
  );
}
