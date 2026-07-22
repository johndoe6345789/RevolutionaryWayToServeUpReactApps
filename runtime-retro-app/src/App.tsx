import React, { useMemo, useState } from "react";
import { Router, Route, Link, useRouter } from "./router.tsx";
import Emulator from "./Emulator.tsx";
import ConsoleArcade from "./ConsoleArcade.tsx";
import ArchiveCatalog from "./ArchiveCatalog.tsx";
import { findGame, games } from "./games.ts";
import { findSystem, systems } from "./systems.ts";

function Logo(): React.JSX.Element { return <Link to="/" className="logo"><span className="logo-mark">R</span><span>Runtime<br />Arcade</span></Link>; }

function Header(): React.JSX.Element {
  const { path } = useRouter();
  return <header><div className="nav-wrap"><Logo /><nav aria-label="Main navigation"><Link to="/games" className={path.startsWith("/games") || path.startsWith("/play") ? "active" : ""}>Games</Link><Link to="/systems" className={path.startsWith("/systems") ? "active" : ""}>Systems</Link><Link to="/catalog" className={path === "/catalog" ? "active" : ""}>Archive</Link><Link to="/technology" className={path === "/technology" ? "active" : ""}>Technology</Link><Link to="/about" className={path === "/about" ? "active" : ""}>About</Link></nav><Link to="/systems" className="button tiny">Insert coin</Link></div></header>;
}

function Home(): React.JSX.Element {
  return <><main className="hero"><div className="eyebrow"><i /> ZERO BUILD · FULL SPEED</div><h1>Code at the<br /><em>speed of play.</em></h1><p className="lede">TypeScript fetched, compiled, and executed by your browser. Client-side routes. Real emulation. No application bundle.</p><div className="actions"><Link to="/play/pixel-painter" className="button">Launch arcade <span>→</span></Link><Link to="/technology" className="text-link">How does it work?</Link></div><div className="hero-card"><div className="scanlines" /><div className="pixel-grid">{Array.from({ length: 96 }, (_, index) => <i key={index} className={index % 11 === 0 || index % 17 === 0 ? "lit" : ""} />)}</div><div className="hero-card-label"><strong>LIVE RUNTIME</strong><span>TSX → BABEL → REACT</span></div></div></main><section className="stats"><div><strong>0</strong><span>build steps</span></div><div><strong>3</strong><span>original ROMs</span></div><div><strong>100%</strong><span>client routed</span></div></section><section className="section"><div className="section-head"><div><span className="kicker">CURATED CIRCUITS</span><h2>Featured programs</h2></div><Link to="/games" className="text-link">View the whole library →</Link></div><GameGrid items={games} /></section></>;
}

function GameGrid({ items }: { items: typeof games }): React.JSX.Element {
  return <div className="game-grid">{items.map((game, index) => <article className={`game-card ${game.accent}`} key={game.id}><div className="game-art"><span>0{index + 1}</span><div className="sprite">{index === 0 ? "▰" : index === 1 ? "✦" : "◩"}</div></div><div className="game-body"><div className="meta"><span>{game.system}</span><span>{game.year}</span></div><h3>{game.title}</h3><p>{game.summary}</p><div className="card-actions"><Link to={`/play/${game.id}`} className="button small">Play</Link><Link to={`/games/${game.id}`} className="icon-link" aria-label={`Details for ${game.title}`}>↗</Link></div></div></article>)}</div>;
}

function Library(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => games.filter((game) => `${game.title} ${game.system}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <main className="page section"><span className="kicker">PROGRAM DIRECTORY</span><div className="page-title"><h1>Game library</h1><span>{filtered.length.toString().padStart(2, "0")} PROGRAMS</span></div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles or systems" aria-label="Search games" /></label><GameGrid items={filtered} />{filtered.length === 0 && <p className="empty">NO PROGRAMS MATCH THAT QUERY.</p>}</main>;
}

function GameDetails({ id }: { id: string }): React.JSX.Element {
  const game = findGame(id);
  if (!game) return <NotFound />;
  return <main className="page detail"><Link to="/games" className="text-link">← Back to library</Link><div className={`detail-art ${game.accent}`}><span>{game.system}</span><strong>{game.title.slice(0, 1)}</strong></div><div className="detail-copy"><span className="kicker">ORIGINAL RUNTIME ROM · {game.year}</span><h1>{game.title}</h1><p className="lede">{game.summary}</p><dl><div><dt>Virtual machine</dt><dd>CHIP-8</dd></div><div><dt>Display</dt><dd>64 × 32 monochrome</dd></div><div><dt>Input</dt><dd>16-key hexadecimal pad</dd></div></dl><Link to={`/play/${game.id}`} className="button">Run program →</Link></div></main>;
}

function Play({ id }: { id: string }): React.JSX.Element {
  const game = findGame(id);
  if (!game) return <NotFound />;
  return <main className="page play-page"><div className="play-heading"><div><span className="kicker">NOW EMULATING</span><h1>{game.title}</h1></div><Link to={`/games/${game.id}`} className="text-link">Program details ↗</Link></div><Emulator game={game} /></main>;
}

function Systems(): React.JSX.Element { return <main className="page section"><span className="kicker">MULTI-SYSTEM DECK</span><div className="page-title"><h1>Choose a system</h1><span>LOCAL ROMS ONLY</span></div><p className="lede system-lede">Play software you own without sending it anywhere. Console cores are loaded on demand; your ROM remains a temporary browser object URL.</p><div className="example-shelf"><div><span className="kicker">PLAY RIGHT NOW</span><h2>Bundled examples</h2></div><Link to="/play/pixel-painter" className="example-pill">Pixel Painter <small>CHIP-8</small></Link><Link to="/play/random-stars" className="example-pill">Random Stars <small>CHIP-8</small></Link><Link to="/play/diagonal-drift" className="example-pill">Diagonal Drift <small>CHIP-8</small></Link><Link to="/systems/spectrum?example=csss" className="example-pill featured">CSSS <small>ZX SPECTRUM</small></Link></div><div className="system-grid">{systems.map((system) => <Link key={system.id} to={`/systems/${system.id}`} className={`system-card ${system.colour}`}><span>{system.era}</span><strong>{system.name}</strong><p>{system.description}</p><small>{system.extensions.join(" · ")}</small><i>→</i></Link>)}</div></main>; }

function SystemPlayer({ id }: { id: string }): React.JSX.Element { const system = findSystem(id); if (!system) return <NotFound />; return <main className="page system-page"><Link to="/systems" className="text-link">← All systems</Link><div className="play-heading"><div><span className="kicker">{system.era} HARDWARE PROFILE</span><h1>{system.name}</h1></div><span className="local-badge">ROM NEVER UPLOADED</span></div><ConsoleArcade system={system} /><p className="legal-copy">Only load homebrew, public-domain software, or cartridge/tape dumps you are legally entitled to use. Runtime Arcade does not provide commercial ROMs.</p></main>; }

function Catalog(): React.JSX.Element { return <main className="page section"><span className="kicker">CONNECTED COLLECTIONS</span><div className="page-title"><h1>Archive explorer</h1><span>POWERED BY ARCHIVE.ORG</span></div><p className="lede system-lede">Search community software listings without leaving the deck. Results open on Internet Archive so you can review descriptions, rights information, and files at the source.</p><ArchiveCatalog /></main>; }

function Technology(): React.JSX.Element {
  return <main className="page section prose"><span className="kicker">UNDER THE CARTRIDGE</span><h1>TypeScript with no build step.</h1><p className="lede">The source files powering this page are still TypeScript and TSX when the server sends them. The bootloader turns them into executable modules inside this browser session.</p><div className="flow"><div><b>01</b><strong>Fetch</strong><span>The loader requests App.tsx and discovers its imports.</span></div><i>→</i><div><b>02</b><strong>Compile</strong><span>Babel Standalone strips types and transforms JSX.</span></div><i>→</i><div><b>03</b><strong>Execute</strong><span>A module registry resolves dependencies and React renders.</span></div><i>→</i><div><b>04</b><strong>Route</strong><span>History API navigation swaps views without a reload.</span></div></div><pre><code>{`// This component reached you as TSX\ninterface GreetingProps { name: string }\nexport function Greeting({ name }: GreetingProps) {\n  return <h1>Hello, {name}</h1>;\n}`}</code></pre><div className="proof"><span id="compile-proof">●</span><div><strong>Runtime proof is active</strong><small>Inspect window.__RUNTIME_RETRO__ for compiler timing and module count.</small></div></div></main>;
}

function About(): React.JSX.Element { return <main className="page section prose"><span className="kicker">THE MISSION</span><h1>Make the browser feel magical again.</h1><p className="lede">Runtime Arcade revives an ambitious idea: source code should be immediately playable. It pairs a custom zero-build React bootloader with a tiny, honest emulator and original programs that are safe to share.</p><div className="manifesto"><h2>Why this matters</h2><p>Most React deployments hide the source behind a build pipeline. This experiment asks what happens when the browser receives human-readable TypeScript, resolves the module graph, compiles it, and runs it directly. The result is slower to boot than a bundled production app—but radically transparent, portable, and fun.</p></div><Link to="/technology" className="button">Explore the runtime →</Link></main>; }

function NotFound(): React.JSX.Element { return <main className="page not-found"><span>404</span><h1>Cartridge not found.</h1><p>That route is not registered in this runtime.</p><Link to="/" className="button">Return home</Link></main>; }

function RoutedApp(): React.JSX.Element {
  const { path } = useRouter();
  const known = path === "/" || path === "/games" || path === "/systems" || path === "/catalog" || path === "/technology" || path === "/about" || /^\/games\/[^/]+\/?$/.test(path) || /^\/play\/[^/]+\/?$/.test(path) || /^\/systems\/[^/]+\/?$/.test(path);
  return <div className="site"><Header /><Route path="/">{() => <Home />}</Route><Route path="/games">{() => <Library />}</Route><Route path="/games/:id">{({ params }) => <GameDetails id={params.id} />}</Route><Route path="/play/:id">{({ params }) => <Play id={params.id} />}</Route><Route path="/systems">{() => <Systems />}</Route><Route path="/systems/:id">{({ params }) => <SystemPlayer id={params.id} />}</Route><Route path="/catalog">{() => <Catalog />}</Route><Route path="/technology">{() => <Technology />}</Route><Route path="/about">{() => <About />}</Route>{!known && <NotFound />}<footer><Logo /><p>Source code delivered raw. Compiled with curiosity.</p><div><Link to="/games">Games</Link><Link to="/systems">Systems</Link><Link to="/catalog">Archive</Link><Link to="/technology">Technology</Link><Link to="/about">About</Link></div></footer></div>;
}

export default function App(): React.JSX.Element { return <Router><RoutedApp /></Router>; }
