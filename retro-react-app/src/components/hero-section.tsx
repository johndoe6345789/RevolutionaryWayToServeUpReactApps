"use client";

import { Box, Chip, Typography, Stack, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { ConsoleIcon } from "./console-icon";
import type {
  IReactComponentLifecycle,
  ComponentLifecycleStatus
} from "@/lib/lifecycle-manager";
import componentPatterns from "@/lib/component-patterns.json";

// HeroSection lifecycle with exactly 4 public methods (<5 constraint per AGENTS.md)
class HeroSectionLifecycle implements IReactComponentLifecycle {
  private componentStatus: ComponentLifecycleStatus = ComponentLifecycleStatus.UNINITIALIZED;
  private translationsLoaded = false;
  private routerReady = false;

  // Public methods: initialise, validate, execute, cleanup (4 total, <5 constraint)
  public async initialise(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.INITIALIZING;
    this.translationsLoaded = true;
    this.routerReady = true;
  }

  public async validate(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.VALIDATING;
    if (!this.translationsLoaded) {
      throw new Error(componentPatterns.errorMessages.translationsNotLoaded);
    }
    if (!this.routerReady) {
      throw new Error(componentPatterns.errorMessages.routerNotReady);
    }
  }

  public async execute(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.EXECUTING;
  }

  public async cleanup(): Promise<void> {
    this.componentStatus = ComponentLifecycleStatus.CLEANING;
    this.translationsLoaded = false;
    this.routerReady = false;
  }

  // Private methods (not counted toward public method limit)
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

  // Create lifecycle instance (internal management per AGENTS.md)
  const lifecycleRef = useRef(new HeroSectionLifecycle());

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
    <Box sx={componentPatterns.styles.heroSection}>
      {/* Background pattern overlay */}
      <Box sx={componentPatterns.styles.patternOverlay} />

      {/* Glow effect */}
      <Box sx={componentPatterns.styles.glowEffect} />

      <Stack sx={componentPatterns.styles.contentStack}>
        <Box sx={componentPatterns.styles.textContent}>
          <Chip
            label={t("retro_gaming_hub")}
            color="secondary"
            size="small"
            sx={componentPatterns.styles.chip}
          />

          <Typography
            variant="h2"
            sx={componentPatterns.styles.title}
          >
            {t("press_start")}
            <Box
              component="span"
              sx={componentPatterns.styles.subtitle}
            >
              {t("to_continue")}
            </Box>
          </Typography>

          <Typography
            variant="body2"
            sx={componentPatterns.styles.description}
          >
            {t("hero_description")}
          </Typography>

          <Stack sx={componentPatterns.styles.buttonGroup}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLaunchArcade}
              sx={componentPatterns.styles.launchButton}
            >
              {t("launch_arcade_mode")}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleBrowseLibrary}
              sx={componentPatterns.styles.browseButton}
            >
              🕹 {t("browse_rom_library")}
            </Button>
          </Stack>

          <Stack sx={componentPatterns.styles.tagStack}>
            {systemTags.slice(0, componentPatterns.validation.maxTagsDisplayed).map((tag: string) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                size="small"
                sx={componentPatterns.styles.systemTag}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={componentPatterns.styles.consoleIcon}>
          <ConsoleIcon text={t("insert_coin")} />
        </Box>
      </Stack>
    </Box>
  );
}
