"use client";

import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Rating,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  title: string;
  platform: string;
  year: string;
  description: string;
  image: string;
  rating: number;
}

export function FeaturedGames(): React.JSX.Element {
  const t = useTranslations("games");
  const gamesT = useTranslations("games_data");
  const gameT = useTranslations("game");
  const router = useRouter();

  const featuredGames = gamesT.raw("featured") as Game[];

  const handlePlayGame = (gameId: string): void => {
    router.push(`/games/${gameId}`);
  };

  const handleViewDetails = (gameId: string): void => {
    router.push(`/games/${gameId}`);
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            {t("featured_games")}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {t("popular_games")}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {featuredGames.map((game) => (
          <Card
            key={game.id}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
                borderColor: "primary.main",
              },
            }}
          >
            <Box sx={{ position: "relative" }}>
              <CardMedia
                component="div"
                sx={{
                  height: 180,
                  backgroundImage: `url(${game.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  gap: 0.5,
                }}
              >
                <Chip
                  label={game.platform}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    backgroundColor: "rgba(0, 229, 255, 0.9)",
                    color: "background.paper",
                  }}
                />
                <Chip
                  label={game.year}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    color: "text.primary",
                  }}
                />
              </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {game.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  mb: 2,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {game.description}
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Rating
                  value={game.rating}
                  readOnly
                  size="small"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "secondary.main",
                    },
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {game.rating}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => {
                    handlePlayGame(game.id);
                  }}
                  sx={{
                    flex: 1,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  {gameT("play")}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => {
                    handleViewDetails(game.id);
                  }}
                  sx={{
                    flex: 1,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    borderWidth: 1.5,
                  }}
                >
                  {gameT("description")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            router.push("/games");
          }}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 999,
            fontSize: "0.9rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          }}
        >
          {t("all_games")}
        </Button>
      </Box>
    </Box>
  );
}
