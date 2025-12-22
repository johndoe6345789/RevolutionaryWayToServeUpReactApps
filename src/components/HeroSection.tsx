import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { SYSTEM_TAGS, CTA_BUTTON_STYLE } from "../data";
import { getStringService } from "../../bootstrap/services/string-service";

export default function HeroSection() {
  const strings = getStringService();
  
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius:3,
        px: { xs: 3, md: 5 },
        py: { xs: 4, md: 6 },
        mb: 5,
        background:
          "radial-gradient(circle at 0% 0%, #ff6ec720 0, transparent 55%), radial-gradient(circle at 100% 100%, #00e5ff20 0, transparent 55%), linear-gradient(135deg, #050510 0, #080820 35%, #050510 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
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
            label={strings.getLabel('retro_gaming_hub')}
            color="secondary"
            size="small"
            sx={{ mb: 2, fontSize: 10, letterSpacing: "0.16em", borderRadius: 999 }}
          />

          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 26, md: 34 }, textTransform: "uppercase", mb: 2 }}
          >
            {strings.getLabel('press_start')}
            <Box component="span" sx={{ color: "primary.main" }}>
              {" "}{strings.getLabel('to_continue')}
            </Box>
          </Typography>

          <Typography
            variant="body2"
            sx={{ maxWidth: 480, opacity: 0.86, mb: 3, lineHeight: 1.7 }}
          >
            Boot straight into your retro library. One launchpad for emulators,
            ROMs, save states, shaders, and couch co-op nights.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              sx={CTA_BUTTON_STYLE}
              onClick={() => console.log(strings.getConsole('launch_arcade'))}
            >
              {strings.getLabel('launch_arcade_mode')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={CTA_BUTTON_STYLE}
              onClick={() => console.log(strings.getConsole('browse_library'))}
            >
              🕹 {strings.getLabel('browse_rom_library')}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }} flexWrap="wrap">
            {strings.getGameData('systemTags').map((tag: string) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 999,
                  borderColor: "rgba(255,255,255,0.1)",
                  fontSize: 10,
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
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 260 180"
            xmlns="http://www.w3.org/2000/svg"
            sx={{
              width: { xs: "80%", md: "100%" },
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.8))",
            }}
          >
            <defs>
              <linearGradient id="console-body" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#050510" />
              </linearGradient>
              <linearGradient id="screen-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff6ec7" />
                <stop offset="50%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#ffd54f" />
              </linearGradient>
            </defs>

            <rect
              x="10"
              y="20"
              width="240"
              height="150"
              rx="18"
              ry="18"
              fill="url(#console-body)"
              stroke="#33334d"
              strokeWidth="2"
            />

            <rect
              x="35"
              y="40"
              width="190"
              height="90"
              rx="8"
              ry="8"
              fill="#05050c"
              stroke="#29293d"
            />

            <rect
              x="40"
              y="45"
              width="180"
              height="80"
              rx="6"
              ry="6"
              fill="url(#screen-glow)"
              fillOpacity="0.18"
            />

            <text x="130" y="92" textAnchor="middle" fontSize="10" fill="#f5f5f5">
              {strings.getLabel('insert_coin')}
            </text>

            <circle cx="55" cy="135" r="10" fill="#22223a" />
            <circle cx="205" cy="135" r="10" fill="#ff6ec7" />
            <circle cx="185" cy="125" r="8" fill="#00e5ff" />
            <circle cx="225" cy="145" r="8" fill="#ffd54f" />

            <rect x="40" y="122" width="6" height="26" fill="#2f2f46" />
            <rect x="34" y="128" width="18" height="6" fill="#2f2f46" />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
