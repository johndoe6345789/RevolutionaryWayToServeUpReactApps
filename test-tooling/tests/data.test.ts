import { FEATURED_GAMES, SYSTEM_TAGS } from "../../src/data";

describe("shared data", () => {
  it("exports a rich featured list", () => {
    expect(FEATURED_GAMES.length).toBeGreaterThanOrEqual(1);
    for (const game of FEATURED_GAMES) {
      expect(game.id).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.description).toBeTruthy();
      expect(typeof game.cover).toBe("string");
      expect(game.cover).toContain("https://");
      expect(Array.isArray(game.genre)).toBe(true);
      expect(game.genre.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("documents the system tags that the UI advertises", () => {
    expect(SYSTEM_TAGS).toContain("Arcade");
    expect(SYSTEM_TAGS).toContain("SNES");
  });
});
