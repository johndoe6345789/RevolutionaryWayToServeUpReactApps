import "./linkSrcNodeModules";

import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../src/App";

describe("App shell", () => {
  it("renders the hero and featured sections", () => {
    render(<App />);
    expect(screen.getByText(/RetroDeck/i)).toBeInTheDocument();
    expect(screen.getByText(/Press Start/i)).toBeInTheDocument();
    expect(screen.getByText(/FEATURED LOADOUT/i)).toBeInTheDocument();
  });

  it("shows a quick play button for each featured game", () => {
    render(<App />);
    const quickPlayButtons = screen.getAllByRole("button", { name: /Quick Play/i });
    expect(quickPlayButtons.length).toBeGreaterThanOrEqual(1);
  });
});
