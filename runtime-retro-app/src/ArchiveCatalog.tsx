import React, { useEffect, useState } from "react";

interface ArchiveItem { identifier: string; title?: string; creator?: string | string[]; description?: string; licenseurl?: string; downloads?: number; }
interface ArchiveResponse { response?: { docs?: ArchiveItem[]; numFound?: number }; }

const platforms = [
  { id: "spectrum", label: "ZX Spectrum", query: 'subject:("ZX Spectrum")' },
  { id: "nes", label: "NES", query: 'subject:(NES OR Famicom)' },
  { id: "snes", label: "SNES", query: 'subject:(SNES OR "Super Nintendo")' },
  { id: "gba", label: "GBA", query: 'subject:("Game Boy Advance" OR GBA)' },
];

function text(value: string | string[] | undefined): string { return Array.isArray(value) ? value.join(", ") : (value ?? "Community uploader"); }

export default function ArchiveCatalog(): React.JSX.Element {
  const [platform, setPlatform] = useState("spectrum");
  const [query, setQuery] = useState("homebrew");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const selected = platforms.find((entry) => entry.id === platform) ?? platforms[0];
    const search = [`mediatype:software`, selected.query, query.trim() ? `(${query.trim().replace(/[^a-zA-Z0-9 _-]/g, " ")})` : ""].filter(Boolean).join(" AND ");
    const parameters = new URLSearchParams({ q: search, rows: "24", page: "1", output: "json", sort: "downloads desc" });
    ["identifier", "title", "creator", "description", "licenseurl", "downloads"].forEach((field) => parameters.append("fl[]", field));
    setLoading(true); setError("");
    fetch(`https://archive.org/advancedsearch.php?${parameters}`)
      .then((response) => { if (!response.ok) throw new Error(`Archive.org returned ${response.status}`); return response.json() as Promise<ArchiveResponse>; })
      .then((data) => setItems(data.response?.docs ?? []))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [platform, query]);

  return <section className="archive-catalog">
    <div className="catalog-controls"><div className="platform-tabs">{platforms.map((entry) => <button key={entry.id} className={platform === entry.id ? "active" : ""} onClick={() => setPlatform(entry.id)}>{entry.label}</button>)}</div><label className="archive-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="homebrew, demo, public domain…" aria-label="Search Internet Archive" /></label></div>
    <div className="archive-warning"><strong>Discovery, not a rights guarantee.</strong><span>Internet Archive metadata is supplied by uploaders. Check the item page and copyright status before downloading or playing anything.</span></div>
    {loading && <p className="catalog-state">SCANNING INTERNET ARCHIVE…</p>}
    {error && <p className="catalog-state error" role="alert">{error}</p>}
    {!loading && !error && <div className="archive-grid">{items.map((item) => <a key={item.identifier} href={`https://archive.org/details/${encodeURIComponent(item.identifier)}`} target="_blank" rel="noreferrer" className="archive-card"><img src={`https://archive.org/services/img/${encodeURIComponent(item.identifier)}`} alt="" loading="lazy" /><div><span>INTERNET ARCHIVE · {item.downloads ?? 0} VIEWS</span><h3>{item.title ?? item.identifier}</h3><p>{text(item.creator)}</p><small>{item.licenseurl ? "Uploader supplied a licence — verify on item page" : "Rights metadata not supplied"}</small></div><i>↗</i></a>)}</div>}
  </section>;
}
