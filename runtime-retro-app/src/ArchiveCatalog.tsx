import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "./router.tsx";
import { findSystem } from "./systems.ts";

interface ArchiveItem {
  identifier: string;
  title?: string;
  creator?: string | string[];
  description?: string;
  licenseurl?: string;
  downloads?: number;
}
interface ArchiveResponse {
  response?: { docs?: ArchiveItem[]; numFound?: number };
}
interface ArchiveFile {
  name?: string;
  size?: string;
  source?: string;
}
interface ArchiveMetadata {
  files?: ArchiveFile[];
}

const platforms = [
  { id: "spectrum", label: "ZX Spectrum", query: 'subject:("ZX Spectrum")' },
  { id: "nes", label: "NES", query: "subject:(NES OR Famicom)" },
  { id: "snes", label: "SNES", query: 'subject:(SNES OR "Super Nintendo")' },
  { id: "gba", label: "GBA", query: 'subject:("Game Boy Advance" OR GBA)' },
];

function text(value: string | string[] | undefined): string {
  return Array.isArray(value)
    ? value.join(", ")
    : (value ?? "Community uploader");
}
export default function ArchiveCatalog(): React.JSX.Element {
  const { navigate } = useRouter();
  const [platform, setPlatform] = useState("spectrum");
  const [query, setQuery] = useState("homebrew");
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [launching, setLaunching] = useState("");
  const more = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotal(0);
  }, [platform, query]);

  useEffect(() => {
    const controller = new AbortController();
    const selected =
      platforms.find((entry) => entry.id === platform) ?? platforms[0];
    const search = [
      `mediatype:software`,
      selected.query,
      query.trim() ? `(${query.trim().replace(/[^a-zA-Z0-9 _-]/g, " ")})` : "",
    ]
      .filter(Boolean)
      .join(" AND ");
    const parameters = new URLSearchParams({
      q: search,
      rows: "24",
      page: String(page),
      output: "json",
      sort: "downloads desc",
    });
    [
      "identifier",
      "title",
      "creator",
      "description",
      "licenseurl",
      "downloads",
    ].forEach((field) => parameters.append("fl[]", field));
    setLoading(true);
    setError("");
    fetch(`https://archive.org/advancedsearch.php?${parameters}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Archive.org returned ${response.status}`);
        return response.json() as Promise<ArchiveResponse>;
      })
      .then((data) => {
        const next = data.response?.docs ?? [];
        setTotal(data.response?.numFound ?? 0);
        setItems((current) => {
          if (page === 1) return next;
          const known = new Set(current.map((item) => item.identifier));
          return [
            ...current,
            ...next.filter((item) => !known.has(item.identifier)),
          ];
        });
      })
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [platform, query, page]);

  useEffect(() => {
    const target = more.current;
    if (!target || loading || items.length >= total) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPage((current) => current + 1);
      },
      { rootMargin: "500px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [items.length, loading, total]);

  const play = async (item: ArchiveItem): Promise<void> => {
    const system = findSystem(platform);
    if (!system) return;
    setLaunching(item.identifier);
    setError("");
    try {
      const response = await fetch(
        `https://archive.org/metadata/${encodeURIComponent(item.identifier)}`,
      );
      if (!response.ok)
        throw new Error(`Archive.org returned ${response.status}`);
      const metadata = (await response.json()) as ArchiveMetadata;
      const candidates = (metadata.files ?? [])
        .filter((file) => {
          const name = file.name?.toLowerCase() ?? "";
          return system.extensions.some((extension) =>
            name.endsWith(extension),
          );
        })
        .sort((left, right) => {
          const leftZip = left.name?.toLowerCase().endsWith(".zip") ? 1 : 0;
          const rightZip = right.name?.toLowerCase().endsWith(".zip") ? 1 : 0;
          const leftOriginal = left.source === "original" ? 0 : 1;
          const rightOriginal = right.source === "original" ? 0 : 1;
          return (
            leftZip - rightZip ||
            leftOriginal - rightOriginal ||
            Number(left.size ?? 0) - Number(right.size ?? 0)
          );
        });
      const file = candidates[0];
      if (!file?.name)
        throw new Error(
          `No compatible ${system.extensions.join(", ")} file was found in this item.`,
        );
      navigate(
        `/systems/${platform}?archive=${encodeURIComponent(item.identifier)}&file=${encodeURIComponent(file.name)}`,
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not inspect this Archive item.",
      );
      setLaunching("");
    }
  };

  return (
    <section className="archive-catalog">
      <div className="catalog-controls">
        <div className="platform-tabs">
          {platforms.map((entry) => (
            <button
              key={entry.id}
              className={platform === entry.id ? "active" : ""}
              onClick={() => setPlatform(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <label className="archive-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="homebrew, demo, public domain…"
            aria-label="Search Internet Archive"
          />
        </label>
      </div>
      <div className="archive-warning">
        <strong>Streamed from the source.</strong>
        <span>
          Games launch client-side from Internet Archive; nothing is copied to
          this server. Item pages remain available for provenance and rights
          information.
        </span>
      </div>
      {loading && items.length === 0 && (
        <p className="catalog-state">SCANNING INTERNET ARCHIVE…</p>
      )}
      {error && (
        <p className="catalog-state error" role="alert">
          {error}
        </p>
      )}
      {items.length > 0 && (
        <div className="archive-grid">
          {items.map((item) => (
            <article key={item.identifier} className="archive-card">
              <img
                src={`https://archive.org/services/img/${encodeURIComponent(item.identifier)}`}
                alt=""
                loading="lazy"
              />
              <div>
                <span>INTERNET ARCHIVE · {item.downloads ?? 0} VIEWS</span>
                <h3>{item.title ?? item.identifier}</h3>
                <p>{text(item.creator)}</p>
                <div className="archive-actions">
                  <button
                    className="button tiny"
                    disabled={launching === item.identifier}
                    onClick={() => void play(item)}
                  >
                    {launching === item.identifier
                      ? "Finding ROM…"
                      : "Play now"}
                  </button>
                  <a
                    href={`https://archive.org/details/${encodeURIComponent(item.identifier)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Details ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {items.length > 0 && items.length < total && (
        <button
          ref={more}
          className="catalog-more"
          disabled={loading}
          onClick={() => setPage((current) => current + 1)}
        >
          {loading ? "LOADING MORE GAMES…" : "LOAD MORE GAMES"}
        </button>
      )}
    </section>
  );
}
