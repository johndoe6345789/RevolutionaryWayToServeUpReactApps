import { FEATURED_GAMES, SYSTEM_TAGS } from "../../src/data";

describe("shared data", () => {
  it("exposes featured games with core fields and genres", () => {
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

  it("includes arcade and SNES tags used by the UI filter chips", () => {
    expect(SYSTEM_TAGS).toContain("Arcade");
    expect(SYSTEM_TAGS).toContain("SNES");
  });
});
