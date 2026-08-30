# بناء متعدّد المراحل — الناتج صورة تشغيل نحيلة (هدف الذاكرة ≤ 200م.ب وفق خطّة المشروع)
FROM node:22-slim AS build
WORKDIR /app
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
RUN mkdir -p /data && chown node:node /data
VOLUME /data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
