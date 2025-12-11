import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { FEATURED_GAMES } from "../data";

export default function FeaturedGames() {
  return (
    <Box sx={{ mb: 5 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: 14, letterSpacing: "0.2em" }}
        >
          FEATURED LOADOUT
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Curated from your recently played and pinned games
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {FEATURED_GAMES.map((game) => (
          <Grid item xs={12} md={4} key={game.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: "56.25%",
                  backgroundImage: `url(${game.cover})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      textTransform: "uppercase",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                    }}
                  >
                    {game.title}
                  </Typography>
                  <Chip label={game.badge} color="primary" size="small" sx={{ fontSize: 9 }} />
                </Stack>

                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>
                  {game.system}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, opacity: 0.9, lineHeight: 1.6 }}
                >
                  {game.description}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                  {game.genre.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 999,
                        borderColor: "rgba(255,255,255,0.14)",
                        fontSize: 9,
                      }}
                    />
                  ))}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 2 }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{ borderRadius: 999, fontSize: 10, px: 2 }}
                    onClick={() => console.log("Quick play:", game.id)}
                  >
                    ▶ Quick Play
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ fontSize: 10 }}
                    onClick={() => console.log("Details:", game.id)}
                  >
                    View details
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
