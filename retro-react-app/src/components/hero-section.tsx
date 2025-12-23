"use client";

import { Box, Chip, Typography, Stack, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// SVG Console Icon Component
const ConsoleIcon: React.FC<{ text: string }> = ({ text }) => {
  const svgContent = `
    <svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg" style="width: 100%; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.8))">
      <defs>
        <linearGradient id="console-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a1a2e" />
          <stop offset="100%" stop-color="#050510" />
        </linearGradient>
        <linearGradient id="screen-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff6ec7" />
          <stop offset="50%" stop-color="#00e5ff" />
          <stop offset="100%" stop-color="#ffd54f" />
        </linearGradient>
      </defs>

      <rect x="10" y="20" width="240" height="150" rx="18" ry="18" fill="url(#console-body)" stroke="#33334d" stroke-width="2" />
      <rect x="35" y="40" width="190" height="90" rx="8" ry="8" fill="#05050c" stroke="#29293d" />
      <rect x="40" y="45" width="180" height="80" rx="6" ry="6" fill="url(#screen-glow)" fill-opacity="0.18" />
      <text x="130" y="92" text-anchor="middle" font-size="10" fill="#f5f5f5">${text}</text>
      <circle cx="55" cy="135" r="10" fill="#22223a" />
      <circle cx="205" cy="135" r="10" fill="#ff6ec7" />
      <circle cx="185" cy="125" r="8" fill="#00e5ff" />
      <circle cx="225" cy="145" r="8" fill="#ffd54f" />
      <rect x="40" y="122" width="6" height="26" fill="#2f2f46" />
      <rect x="34" y="128" width="18" height="6" fill="#2f2f46" />
    </svg>
  `;

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

export function HeroSection(): React.JSX.Element {
  const t = useTranslations("hero");
  const gamesT = useTranslations("games_data");
  const router = useRouter();

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
