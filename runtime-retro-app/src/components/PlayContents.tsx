import React from "react";

const entries = [
  {
    href: "#find-a-game",
    number: "01",
    title: "Find a game",
    copy: "Search Internet Archive and launch it in the browser.",
  },
  {
    href: "#choose-a-system",
    number: "02",
    title: "Choose a system",
    copy: "Open an emulator and load a file you already have.",
  },
];

export default function PlayContents(): React.JSX.Element {
  return (
    <nav className="play-contents" aria-label="Play page contents">
      <span>ON THIS PAGE</span>
      <div>
        {entries.map((entry) => (
          <a href={entry.href} key={entry.href}>
            <b>{entry.number}</b>
            <span>
              <strong>{entry.title}</strong>
              <small>{entry.copy}</small>
            </span>
            <i>↓</i>
          </a>
        ))}
      </div>
    </nav>
  );
}
