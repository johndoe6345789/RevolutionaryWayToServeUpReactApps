import "./linkSrcNodeModules";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "../../src/App";
import { FEATURED_GAMES } from "../../src/data";

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

  it("invokes toolbar and hero actions when clicked", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<App />);

    const [settingsButton] = screen.getAllByRole("button", { name: /Settings/i });
    const [syncButton] = screen.getAllByRole("button", { name: /Sync/i });
    const [launchButton] = screen.getAllByRole("button", { name: /Launch Arcade Mode/i });
    const [browseButton] = screen.getAllByRole("button", { name: /Browse ROM Library/i });

    fireEvent.click(settingsButton);
    fireEvent.click(syncButton);
    fireEvent.click(launchButton);
    fireEvent.click(browseButton);

    expect(logSpy).toHaveBeenCalledWith("Open settings");
    expect(logSpy).toHaveBeenCalledWith("Sync with cloud");
    expect(logSpy).toHaveBeenCalledWith("Launch Arcade Mode");
    expect(logSpy).toHaveBeenCalledWith("Browse Library");

    logSpy.mockRestore();
  });

  it("logs quick play and detail actions for featured games", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: /Quick Play/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /View details/i })[0]);

    expect(logSpy).toHaveBeenCalledWith("Quick play:", FEATURED_GAMES[0].id);
    expect(logSpy).toHaveBeenCalledWith("Details:", FEATURED_GAMES[0].id);

    logSpy.mockRestore();
  });

  it("renders a card for every featured game", () => {
    render(<App />);

    FEATURED_GAMES.forEach((game) => {
      expect(screen.getByText(game.title)).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole("button", { name: /View details/i });
    expect(detailButtons).toHaveLength(FEATURED_GAMES.length);
  });
});
