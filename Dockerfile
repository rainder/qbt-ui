# syntax=docker/dockerfile:1

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ---- Serve ----
FROM nginx:1.27-alpine

# nginx listens on $WEB_PORT (default 80). Use envsubst to template the
# config at container start so the port is configurable at runtime.
ENV WEB_PORT=80
ENV QBT_BACKEND=http://qbittorrent:8080

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# nginx:1.x's docker-entrypoint already runs envsubst over /etc/nginx/templates/*.template
# into /etc/nginx/conf.d/, so just exposing the env vars is enough.

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${WEB_PORT}/" >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
