import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import HeroSection from "./components/HeroSection";
import FeaturedGames from "./components/FeaturedGames";
import FooterStrip from "./components/FooterStrip";
import { getStringService } from "../string/string-service";

export default function App() {
  const strings = getStringService();
  
  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: 14,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {strings.getLabel('retro_deck')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="text"
                sx={{ fontSize: 10 }}
                onClick={() => console.log(strings.getConsole('open_settings'))}
              >
                {strings.getLabel('settings')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
                onClick={() => console.log(strings.getConsole('sync_with_cloud'))}
              >
                {strings.getLabel('sync')}
              </Button>
            </Stack>
          </Stack>

          <HeroSection />

          <Divider
            sx={{
              mb: 4,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          />

          <FeaturedGames />

          <FooterStrip />
        </Container>
      </Box>
    </>
  );
}
