export interface ConsoleSystem {
  id: string;
  name: string;
  era: string;
  core: string | null;
  extensions: string[];
  colour: string;
  description: string;
}

export const systems: ConsoleSystem[] = [
  {
    id: "spectrum",
    name: "ZX Spectrum",
    era: "1982",
    core: null,
    extensions: [".tap", ".tzx", ".z80", ".sna", ".szx"],
    colour: "spectrum",
    description: "48K and 128K Spectrum emulation powered by JSSpeccy.",
  },
  {
    id: "nes",
    name: "Nintendo NES",
    era: "1983",
    core: "nes",
    extensions: [".nes", ".zip"],
    colour: "nes",
    description: "Famicom and NES cartridges through the FCEUmm core.",
  },
  {
    id: "snes",
    name: "Super Nintendo",
    era: "1990",
    core: "snes",
    extensions: [".sfc", ".smc", ".zip"],
    colour: "snes",
    description: "16-bit SNES and Super Famicom software through Snes9x.",
  },
  {
    id: "gba",
    name: "Game Boy Advance",
    era: "2001",
    core: "gba",
    extensions: [".gba", ".zip"],
    colour: "gba",
    description: "Portable 32-bit games using the high-performance mGBA core.",
  },
];

export function findSystem(id: string): ConsoleSystem | undefined {
  return systems.find((system) => system.id === id);
}
