# Runtime Retro Arcade

This is the zero-build demonstration application for RevolutionaryWayToServeUpReactApps. The server sends the files in `src/` as human-readable TypeScript and TSX. `bootloader.js` fetches their dependency graph and uses Babel Standalone in the browser to strip types, transform JSX, execute the modules, and mount React.

It also demonstrates framework-native client routing through the History API and a real CHIP-8 interpreter running three original programs. No commercial game ROMs are included.

```bash
node server.js
```

Open `http://localhost:3000`. Deep links such as `/games/pixel-painter` and `/play/random-stars` are served through the same boot document and resolved on the client.

Runtime proof is exposed as `window.__RUNTIME_RETRO__` and in the status badge at the bottom-right of the page.
