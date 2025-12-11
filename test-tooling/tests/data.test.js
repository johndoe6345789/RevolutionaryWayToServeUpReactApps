"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../../src/data");
describe("shared data", () => {
    it("exports a rich featured list", () => {
        expect(data_1.FEATURED_GAMES.length).toBeGreaterThanOrEqual(1);
        for (const game of data_1.FEATURED_GAMES) {
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
        expect(data_1.SYSTEM_TAGS).toContain("Arcade");
        expect(data_1.SYSTEM_TAGS).toContain("SNES");
    });
});
