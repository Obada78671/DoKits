#!/bin/bash
# تفتيشُ صندوق أدوات Do Kits — يجرد ما وضعه المالك ويُنبّه مرّةً لكلّ جديد.
#
# قواعدُ الدستور المرعيّة:
#  · ٨هـ — الجدولة من مصدرٍ واحد: /boot/config/plugins/dynamix/nas-custom.cron
#  · ٨ي — العملُ على الخادم لا في جلسة
#  · ٨ص — هذا السكربت **يقرأ ولا يحذف**؛ أقصى ما يفعله إنشاءُ مجلّدات الهيكل
set -uo pipefail

INBOX=/mnt/user/personal/dokits-inbox
STATE="$INBOX/.inbox-state"
SEEN="$STATE/seen.tsv"
JSON="$STATE/INBOX.json"
LOG="$STATE/scan.log"
LIB=/mnt/user/appdata/scripts/nas-bot-lib.sh

[ -d "$INBOX" ] || exit 0
mkdir -p "$STATE" "$INBOX/جديد" "$INBOX/قيد-الدمج" "$INBOX/مدمَجة" "$INBOX/مؤجَّلة" 2>/dev/null
touch "$SEEN"

# ————— الجرد —————
# «مُدخَل» = مجلّدٌ أو ملفٌّ في الجذر أو في «جديد» — لا نغوص في الأشجار
entries=()
while IFS= read -r p; do
  [ -n "$p" ] && entries+=("$p")
done < <(
  find "$INBOX" -mindepth 1 -maxdepth 1 -not -name ".*" \
       -not -name "جديد" -not -name "قيد-الدمج" -not -name "مدمَجة" -not -name "مؤجَّلة" \
       -not -name "README.md" 2>/dev/null
  find "$INBOX/جديد" -mindepth 1 -maxdepth 1 -not -name ".*" 2>/dev/null
)

fresh=()
json_items=""
for p in "${entries[@]}"; do
  name=$(basename "$p")
  kind=$([ -d "$p" ] && echo dir || echo file)
  # بصمةٌ تتغيّر بتغيّر المحتوى: أحدثُ تعديلٍ داخل الشجرة + عددُ الملفّات + الحجم
  newest=$(find "$p" -type f -printf '%T@\n' 2>/dev/null | sort -rn | head -1 | cut -d. -f1)
  [ -z "$newest" ] && newest=$(stat -c %Y "$p" 2>/dev/null || echo 0)
  files=$(find "$p" -type f 2>/dev/null | wc -l)
  bytes=$(du -sb "$p" 2>/dev/null | cut -f1)
  sig="$name|$newest|$files|$bytes"

  grep -Fxq "$sig" "$SEEN" || fresh+=("$name")

  # ملاحظةُ المالك إن وُجدت
  note=""
  for n in "ملاحظة.md" "NOTE.md" "note.md" "README.md"; do
    if [ -f "$p/$n" ]; then note=$(head -c 400 "$p/$n" | tr '\n\t"' '   '); break; fi
  done
  [ "$kind" = file ] && files=1

  json_items="$json_items{\"name\":\"$(printf '%s' "$name" | sed 's/"/\\"/g')\",\"kind\":\"$kind\",\"files\":$files,\"bytes\":${bytes:-0},\"modified\":${newest:-0},\"note\":\"$(printf '%s' "$note" | sed 's/"/\\"/g')\"},"
done

# ————— الحالة للجلسة —————
now=$(date +%s)
{
  printf '{"scannedAt":%s,"inbox":"%s","pending":%s,"newSinceLastScan":%s,"items":[%s]}\n' \
    "$now" "$INBOX" "${#entries[@]}" "${#fresh[@]}" "${json_items%,}"
} > "$JSON.tmp" && mv "$JSON.tmp" "$JSON"

# ————— التنبيه: مرّةً واحدةً لكلّ جديد —————
if [ "${#fresh[@]}" -gt 0 ]; then
  list=$(printf '· %s\n' "${fresh[@]}" | head -8)
  msg="🧰 صندوقُ Do Kits: ${#fresh[@]} جديد
$list

المجموعُ بانتظار الدمج: ${#entries[@]}
قل لي «افحص الصندوق» في الجلسة القادمة."
  if [ -r "$LIB" ]; then
    ( set +u; source "$LIB" >/dev/null 2>&1; lib_init >/dev/null 2>&1; tg_send "$msg" info ) || true
  fi
  # لا نُعلّم المرئيَّ إلّا بعد نجاح الجرد — فلا يضيع تنبيهٌ بسبب عطلٍ عابر
  for p in "${entries[@]}"; do
    name=$(basename "$p")
    newest=$(find "$p" -type f -printf '%T@\n' 2>/dev/null | sort -rn | head -1 | cut -d. -f1)
    [ -z "$newest" ] && newest=$(stat -c %Y "$p" 2>/dev/null || echo 0)
    files=$(find "$p" -type f 2>/dev/null | wc -l)
    bytes=$(du -sb "$p" 2>/dev/null | cut -f1)
    printf '%s|%s|%s|%s\n' "$name" "$newest" "$files" "$bytes"
  done | sort -u > "$SEEN.tmp" && mv "$SEEN.tmp" "$SEEN"
  echo "$(date '+%F %T') جديد=${#fresh[@]} إجمالي=${#entries[@]}" >> "$LOG"
else
  echo "$(date '+%F %T') لا جديد (إجمالي=${#entries[@]})" >> "$LOG"
fi

# سجلٌّ لا ينمو بلا حدّ
tail -500 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
exit 0
