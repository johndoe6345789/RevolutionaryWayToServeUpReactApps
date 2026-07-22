# Runtime Retro Arcade

This is the zero-build demonstration application for RevolutionaryWayToServeUpReactApps. The server sends the files in `src/` as human-readable TypeScript and TSX. `bootloader.js` fetches their dependency graph and uses Babel Standalone in the browser to strip types, transform JSX, execute the modules, and mount React.

It also demonstrates framework-native client routing through the History API and a real CHIP-8 interpreter running three original programs. The system deck adds local-ROM play for ZX Spectrum (JSSpeccy), NES, SNES, and GBA (EmulatorJS/RetroArch cores). ROMs are represented by temporary object URLs and are never uploaded to the server. No commercial game ROMs are included.

EmulatorJS is GPL-3.0 licensed. JSSpeccy 3 is ISC licensed and includes components derived from Fuse. Their emulator assets are loaded on demand from their official public hosts; the Runtime Arcade application remains independently runtime-compiled.

The bundled ZX Spectrum example, [CSSS](https://github.com/TheShich/CSSS), is copyright TheShich and distributed under GPL-3.0. Its unmodified TAP is encoded in `server.js` so the server can return the correct Spectrum MIME type with CORS enabled.

The `/catalog` route searches Internet Archive's public Advanced Search API directly from the browser. Search results link to the original Archive.org item page for provenance and rights review. They are intentionally not passed straight into an emulator: Archive metadata is uploader supplied and a Creative Commons or public-domain label is not, by itself, sufficient verification that a console image is lawful to redistribute.

```bash
node server.js
```

Open `http://localhost:3000`. Deep links such as `/games/pixel-painter` and `/play/random-stars` are served through the same boot document and resolved on the client.

Runtime proof is exposed as `window.__RUNTIME_RETRO__` and in the status badge at the bottom-right of the page.
