FROM node:20-alpine

# Use a lightweight HTTP server to serve the static bundle
RUN npm install -g http-server@0.14.1

WORKDIR /app

# Only copy the files that bootstrap the browser bundle
COPY index.html bootstrap.js config.json styles.scss src/ /app/

EXPOSE 4173

CMD ["http-server", "/app", "-p", "4173", "-c-1"]
