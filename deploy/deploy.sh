#!/bin/bash
# نشر Do Kits على خادم البيت — يُشغَّل على الخادم نفسه:
#   bash /mnt/user/personal/projects/dokits/deploy/deploy.sh
# الالتزامات: بناء بسقف ذاكرة متساوٍ (٨ل) · compose بنمط docker:cli بالمسار المطلق (٨ز) · فحص محتوى لا رمز (١١أ)
set -euo pipefail

P=/mnt/user/personal/projects/dokits
cd "$P"

echo "— سحب آخر الشيفرة"
git pull --ff-only

echo "— بناء الصورة (سقف 3غ، بلا تبديل)"
docker build --memory=3g --memory-swap=3g -t dokits:local -f deploy/Dockerfile .

echo "— تشغيل compose (نمط docker:cli — المادّة ٨ز)"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$P":"$P" -w "$P" \
  docker:cli docker compose -f deploy/docker-compose.yml up -d

echo "— فحص الصحّة (المحتوى لا الرمز)"
sleep 3
curl -fsS http://127.0.0.1:3900/api/health | grep -q '"ok":true' \
  && echo "✓ dokits يعمل على 127.0.0.1:3900" \
  || { echo "✗ فحص الصحّة فشل"; docker logs --tail 30 dokits; exit 1; }
