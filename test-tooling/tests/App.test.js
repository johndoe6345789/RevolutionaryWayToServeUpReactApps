"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const App_1 = __importDefault(require("../../src/App"));
describe("App shell", () => {
    it("renders the hero and featured sections", () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        expect(react_1.screen.getByText(/RetroDeck/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/Press Start/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/FEATURED LOADOUT/i)).toBeInTheDocument();
    });
    it("shows a quick play button for each featured game", () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(App_1.default, {}));
        const quickPlayButtons = react_1.screen.getAllByRole("button", { name: /Quick Play/i });
        expect(quickPlayButtons.length).toBeGreaterThanOrEqual(1);
    });
});
