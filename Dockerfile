FROM node:20-alpine

WORKDIR /app

# Copy the static assets and config needed by the bootstrap runtime
COPY index.html bootstrap.js config.json styles.scss bootstrap/ src/ /app/

# Copy the lightweight proxy/static server and install its runtime deps
COPY server/package.json server/package-lock.json /app/server/
COPY server/server.js /app/server/
RUN npm ci --omit=dev --prefix /app/server

ENV CDN_PROXY_TARGET=https://unpkg.com
ENV ESM_PROXY_TARGET=https://esm.sh
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

EXPOSE 4173

CMD ["node", "server/server.js"]
