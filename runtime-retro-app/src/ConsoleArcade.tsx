import React, { useEffect, useRef, useState } from "react";
import type { ConsoleSystem } from "./systems.ts";

export default function ConsoleArcade({ system }: { system: ConsoleSystem }): React.JSX.Element {
  const [rom, setRom] = useState<{ name: string; url: string } | null>(null);
  const [error, setError] = useState("");
  const objectUrl = useRef<string | null>(null);
  const [spectrumExample, setSpectrumExample] = useState(() => new URLSearchParams(location.search).get("example") === "csss");

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  useEffect(() => {
    if (!rom || !system.core) return;
    const runtime = window as unknown as Record<string, unknown>;
    runtime.EJS_player = "#console-player";
    runtime.EJS_core = system.core;
    runtime.EJS_gameName = rom.name.replace(/\.[^.]+$/, "");
    runtime.EJS_gameUrl = rom.url;
    runtime.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
    runtime.EJS_startOnLoaded = true;
    runtime.EJS_color = "#5cf6ff";
    const loader = document.createElement("script");
    loader.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
    loader.dataset.consoleLoader = "true";
    loader.onerror = (): void => setError("The emulator core could not be downloaded. Check the network and try again.");
    document.body.appendChild(loader);
    return (): void => { loader.remove(); };
  }, [rom?.url, system.core]);

  const chooseRom = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!system.extensions.includes(extension)) { setError(`Expected ${system.extensions.join(", ")}`); return; }
    if (file.size > 64 * 1024 * 1024) { setError("Please choose a ROM smaller than 64 MB."); return; }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setError("");
    setRom({ name: file.name, url: objectUrl.current });
  };

  if (system.id === "spectrum") {
    const exampleUrl = `${location.origin}/examples/csss.tap`;
    const frameUrl = spectrumExample ? `https://jsspeccy.zxdemo.org/#l=${encodeURIComponent(exampleUrl)}` : "https://jsspeccy.zxdemo.org/";
    return <section className="rom-launcher"><div className="privacy-note"><strong>JSSpeccy 3</strong><span>Use its folder button for your own file, or launch the bundled GPL example.</span><button className="button tiny" onClick={() => setSpectrumExample(true)}>Play CSSS</button></div><iframe key={frameUrl} className="spectrum-frame" src={frameUrl} title="JSSpeccy ZX Spectrum emulator" allow="fullscreen; autoplay" /><p className="example-credit">CSSS © TheShich, distributed under GPLv3. Source available on GitHub.</p></section>;
  }

  return <section className="rom-launcher">
    {!rom && <label className="rom-drop"><span className="rom-icon">⬡</span><strong>Insert your {system.name} cartridge</strong><small>Choose a ROM stored on this device. It stays in your browser.</small><input type="file" accept={system.extensions.join(",")} onChange={chooseRom} /><span className="button">Choose ROM</span><em>{system.extensions.join("  ")}</em></label>}
    {error && <p className="rom-error" role="alert">{error}</p>}
    {rom && <><div className="loaded-rom"><span>LOADED LOCALLY</span><strong>{rom.name}</strong><button onClick={() => location.reload()}>Eject</button></div><div id="console-player" className="console-player" /></>}
  </section>;
}
