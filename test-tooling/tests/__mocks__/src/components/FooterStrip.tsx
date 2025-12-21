import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

export default function FooterStrip() {
  return (
    <Box
      sx={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        pt: 2,
        mt: 4,
        mb: 1,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          Insert coin to save settings · Auto-saves shaders, layouts, and
          controller profiles.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="CRT Shader" size="small" variant="outlined" sx={{ fontSize: 9 }} />
          <Chip label="Netplay" size="small" variant="outlined" sx={{ fontSize: 9 }} />
          <Chip label="Big Screen Mode" size="small" variant="outlined" sx={{ fontSize: 9 }} />
        </Stack>
      </Stack>
    </Box>
  );
}
