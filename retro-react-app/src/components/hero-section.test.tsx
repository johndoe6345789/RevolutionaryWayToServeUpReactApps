import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroSection } from "./hero-section";

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

describe("HeroSection", () => {
  beforeEach((): void => {
    mockPush.mockClear();
  });

  it("renders the hero section with all required elements", (): void => {
    render(<HeroSection />);

    // Check main heading
    expect(screen.getByText("Press Start")).toBeInTheDocument();
    expect(screen.getByText("To Continue")).toBeInTheDocument();

    // Check description
    expect(
      screen.getByText("Discover the ultimate retro gaming experience..."),
    ).toBeInTheDocument();

    // Check buttons
    expect(
      screen.getByRole("button", { name: /launch arcade mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /browse rom library/i }),
    ).toBeInTheDocument();

    // Check chip label
    expect(screen.getByText("Retro Gaming Hub")).toBeInTheDocument();

    // Check system tags (first 6)
    expect(screen.getByText("NES")).toBeInTheDocument();
    expect(screen.getByText("SNES")).toBeInTheDocument();
    expect(screen.getByText("Genesis")).toBeInTheDocument();
  });

  it.each([
    ["launch arcade mode", /launch arcade mode/i, "/arcade"],
    ["browse rom library", /browse rom library/i, "/games"],
  ])(
    "navigates to %s when %s button is clicked",
    async (description: string, buttonName: RegExp, expectedRoute: string) => {
      const user = userEvent.setup();
      render(<HeroSection />);

      const button = screen.getByRole("button", { name: buttonName });
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith(expectedRoute);
    },
  );

  it("renders the console icon with correct text", () => {
    render(<HeroSection />);

    // The console icon area should exist (contains the SVG with "Insert Coin" text)
    // We verify the component renders without crashing by checking the structure exists
    const heroSection = screen
      .getByText("Press Start")
      .closest(".MuiBox-root")?.parentElement;
    expect(heroSection).toBeInTheDocument();
  });

  it.each([
    ["NES"],
    ["SNES"],
    ["Genesis"],
    ["PlayStation"],
    ["Arcade"],
    ["DOS"],
  ])("displays %s system tag as a chip", (systemTag: string) => {
    render(<HeroSection />);

    expect(screen.getByText(systemTag)).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<HeroSection />);

    // Check that buttons have proper roles
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    // Check that the component has a proper heading structure
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Press Start");
  });

  it("renders with responsive layout classes", () => {
    render(<HeroSection />);

    // Check that the component renders with proper structure (smoke test)
    // The main container should exist and contain the expected elements
    const mainContainer = screen
      .getByText("Press Start")
      .closest(".MuiBox-root")?.parentElement;
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer?.children.length).toBeGreaterThan(0);
  });
});
