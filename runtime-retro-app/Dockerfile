FROM node:22-alpine
WORKDIR /app
COPY . .
RUN mkdir -p jsspeccy/roms jsspeccy/tapeloaders \
    && wget -q https://jsspeccy.zxdemo.org/jsspeccy/jsspeccy.js -O jsspeccy/jsspeccy.js \
    && wget -q https://jsspeccy.zxdemo.org/jsspeccy/jsspeccy-worker.js -O jsspeccy/jsspeccy-worker.js \
    && wget -q https://jsspeccy.zxdemo.org/jsspeccy/jsspeccy-core.wasm -O jsspeccy/jsspeccy-core.wasm \
    && for rom in 48 128-0 128-1 pentagon-0 trdos; do wget -q "https://jsspeccy.zxdemo.org/jsspeccy/roms/$rom.rom" -O "jsspeccy/roms/$rom.rom"; done \
    && for loader in tape_48 tape_128 tape_128_usr0 tape_pentagon tape_pentagon_usr0; do wget -q "https://jsspeccy.zxdemo.org/jsspeccy/tapeloaders/$loader.szx" -O "jsspeccy/tapeloaders/$loader.szx"; done
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
