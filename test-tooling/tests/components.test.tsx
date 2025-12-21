import React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";

import HeroSection from "../../src/components/HeroSection";
import FeaturedGames from "../../src/components/FeaturedGames";
import FooterStrip from "../../src/components/FooterStrip";
import { FEATURED_GAMES, SYSTEM_TAGS } from "../../src/data";

const renderWithTheme = (ui: React.ReactElement) => render(ui);

afterEach(() => cleanup());

describe("HeroSection", () => {
  it("renders the hero heading and system tags", () => {
    renderWithTheme(<HeroSection />);
    expect(screen.getByText(/Press Start/i)).toBeInTheDocument();
    SYSTEM_TAGS.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("logs CTA interactions", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    renderWithTheme(<HeroSection />);
    fireEvent.click(screen.getByRole("button", { name: /Launch Arcade Mode/i }));
    fireEvent.click(screen.getByRole("button", { name: /Browse ROM Library/i }));
    expect(logSpy).toHaveBeenCalledWith("Launch Arcade Mode");
    expect(logSpy).toHaveBeenCalledWith("Browse Library");
    logSpy.mockRestore();
  });
});

describe("FeaturedGames", () => {
  it("renders a card for each featured title and reports actions", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    renderWithTheme(<FeaturedGames />);
    expect(screen.getAllByRole("button", { name: /Quick Play/i }).length).toBe(
      FEATURED_GAMES.length
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Quick Play/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /View details/i })[0]);
    expect(logSpy).toHaveBeenCalledWith("Quick play:", FEATURED_GAMES[0].id);
    expect(logSpy).toHaveBeenCalledWith("Details:", FEATURED_GAMES[0].id);
    logSpy.mockRestore();
  });
});

describe("FooterStrip", () => {
  it("shows the footer copy and supporting chips", () => {
    renderWithTheme(<FooterStrip />);
    expect(screen.getByText(/Insert coin to save settings/i)).toBeInTheDocument();
    expect(screen.getByText(/CRT Shader/i)).toBeInTheDocument();
    expect(screen.getByText(/Big Screen Mode/i)).toBeInTheDocument();
  });
});
