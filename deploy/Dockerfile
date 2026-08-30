# بناء متعدّد المراحل — الناتج صورة تشغيل نحيلة (هدف الذاكرة ≤ 200م.ب وفق خطّة المشروع)
FROM node:22-slim AS build
WORKDIR /app
# سقف V8 أثناء البناء — مع سقف docker build الخارجيّ (المادّة ٨ل، دفاع مزدوج)
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS run
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DB_PATH=/data/dokits.db
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN mkdir -p /data .next/cache && chown -R node:node /data .next/cache
VOLUME /data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
