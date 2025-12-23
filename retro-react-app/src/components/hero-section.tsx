"use client";

import { Box, Chip, Typography, Stack, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  IReactComponentLifecycle,
  ComponentLifecycleStatus,
  useComponentLifecycle
} from "@/lib/lifecycle-manager";
import componentPatterns from "@/lib/component-patterns.json";

// SVG Console Icon Component - now uses extracted patterns
const ConsoleIcon: React.FC<{ text: string }> = ({ text }) => {
  const svgLines = componentPatterns.svg.consoleIcon;
  const svgContent = svgLines.join('\n').replace('{text}', text);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

// HeroSection lifecycle implementation
class HeroSectionLifecycle implements IReactComponentLifecycle {
  private componentStatus: ComponentLifecycleStatus = ComponentLifecycleStatus.UNINITIALIZED;
  private translationsLoaded = false;
  private routerReady = false;

  public async initialise(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.INITIALIZING;
    // Initialize component resources
    this.translationsLoaded = true;
    this.routerReady = true;
  }

  public async validate(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.VALIDATING;
    // Validate required dependencies
    if (!this.translationsLoaded) {
      throw new Error('Translations not loaded');
    }
    if (!this.routerReady) {
      throw new Error('Router not ready');
    }
  }

  public async execute(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.EXECUTING;
    // Component is ready for interaction
  }

  public async cleanup(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.CLEANING;
    // Cleanup resources
    this.translationsLoaded = false;
    this.routerReady = false;
    this.componentStatus = ComponentLifecycleStatus.DESTROYED;
  }

  public debug(): Record<string, unknown> {
    return {
      status: this.componentStatus,
      translationsLoaded: this.translationsLoaded,
      routerReady: this.routerReady,
    };
  }

  public async reset(): Promise<void> {
    await this.cleanup();
    await this.initialise();
  }

  public status(): ComponentLifecycleStatus {
    return this.componentStatus;
  }
}

export function HeroSection(): React.JSX.Element {
  const t = useTranslations("hero");
  const gamesT = useTranslations("games_data");
  const router = useRouter();

  // Create lifecycle instance
  const lifecycleRef = useRef(new HeroSectionLifecycle());
  const lifecycleStatus = useComponentLifecycle('hero-section', lifecycleRef.current);

  const systemTags = gamesT.raw("systemTags") as string[];

  const handleLaunchArcade = (): void => {
    // Navigate to arcade mode
    router.push("/arcade");
  };

  const handleBrowseLibrary = (): void => {
    // Navigate to games library
    router.push("/games");
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        px: { xs: 3, md: 5 },
        py: { xs: 4, md: 6 },
        mb: 5,
        background:
          "radial-gradient(circle at 0% 0%, rgba(255, 110, 199, 0.1) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(0, 229, 255, 0.1) 0, transparent 55%), linear-gradient(135deg, rgba(5, 5, 16, 0.95) 0, rgba(8, 8, 32, 0.8) 35%, rgba(5, 5, 16, 0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Background pattern overlay */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "soft-light",
          opacity: 0.5,
        }}
      />

      {/* Glow effect */}
      <Box
        sx={{
          position: "absolute",
          inset: -40,
          border: "2px solid rgba(255,255,255,0.05)",
          borderRadius: "32px",
          boxShadow: "0 0 80px rgba(0,0,0,0.9)",
        }}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box flex={1}>
          <Chip
            label={t("retro_gaming_hub")}
            color="secondary"
            size="small"
            sx={{
              mb: 2,
              fontSize: 10,
              letterSpacing: "0.16em",
              borderRadius: 999,
              backgroundColor: "rgba(0, 229, 255, 0.1)",
              color: "secondary.main",
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 26, md: 34 },
              textTransform: "uppercase",
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            {t("press_start")}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                display: "block",
                fontSize: { xs: 22, md: 28 },
                mt: 1,
              }}
            >
              {t("to_continue")}
            </Box>
          </Typography>

          <Typography
            variant="body2"
            sx={{
              maxWidth: 480,
              opacity: 0.86,
              mb: 3,
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            {t("hero_description")}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleLaunchArcade}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {t("launch_arcade_mode")}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleBrowseLibrary}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              🕹 {t("browse_rom_library")}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }} flexWrap="wrap">
            {systemTags.slice(0, 6).map((tag: string) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 999,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            flexBasis: { xs: "100%", md: 320 },
            display: "flex",
            justifyContent: "center",
            mt: { xs: 2, md: 0 },
          }}
        >
          <ConsoleIcon text={t("insert_coin")} />
        </Box>
      </Stack>
    </Box>
  );
}
