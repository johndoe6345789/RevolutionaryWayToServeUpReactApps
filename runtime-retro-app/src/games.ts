export interface Game {
  id: string;
  title: string;
  system: string;
  year: number;
  accent: string;
  summary: string;
  controls: string;
  rom: number[];
}

// Original CHIP-8 programs written for this demonstration. No commercial ROMs are distributed.
export const games: Game[] = [
  {
    id: "pixel-painter",
    title: "Pixel Painter",
    system: "CHIP-8",
    year: 2026,
    accent: "cyan",
    summary:
      "Guide a bright pixel around the display and paint a trail through the dark.",
    controls: "2 / 4 / 6 / 8 move",
    rom: [
      0x00, 0xe0, 0x60, 0x20, 0x61, 0x10, 0xa0, 0x50, 0xd0, 0x11, 0xf2, 0x0a,
      0x32, 0x02, 0x70, 0xff, 0x32, 0x08, 0x70, 0x01, 0x32, 0x04, 0x71, 0xff,
      0x32, 0x06, 0x71, 0x01, 0x12, 0x08,
    ],
  },
  {
    id: "random-stars",
    title: "Random Stars",
    system: "CHIP-8",
    year: 2026,
    accent: "pink",
    summary:
      "Grow a procedural star field, one emulated instruction cycle at a time.",
    controls: "Any key adds stars",
    rom: [
      0x00, 0xe0, 0xa0, 0x50, 0xc0, 0x3f, 0xc1, 0x1f, 0xd0, 0x11, 0xf2, 0x0a,
      0x12, 0x04,
    ],
  },
  {
    id: "diagonal-drift",
    title: "Diagonal Drift",
    system: "CHIP-8",
    year: 2026,
    accent: "amber",
    summary:
      "A tiny generative demo that wraps a sprite endlessly around the screen.",
    controls: "Any key advances the drift",
    rom: [
      0x00, 0xe0, 0x60, 0x00, 0x61, 0x00, 0xa0, 0x50, 0xd0, 0x11, 0xf2, 0x0a,
      0x70, 0x02, 0x71, 0x01, 0x40, 0x40, 0x60, 0x00, 0x41, 0x20, 0x61, 0x00,
      0x12, 0x08,
    ],
  },
];

export function findGame(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}
