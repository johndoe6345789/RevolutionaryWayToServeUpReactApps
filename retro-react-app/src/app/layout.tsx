import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { getTranslations } from "next-intl/server";
import "./globals.css";

// Use JetBrains Mono for that retro gaming feel
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

interface LayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: LayoutProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "navigation" });

  return {
    title: t("retro_deck"),
    description:
      "The ultimate retro gaming experience with pixel-perfect emulation and modern features.",
    keywords: [
      "retro gaming",
      "emulation",
      "classic games",
      "NES",
      "SNES",
      "arcade",
    ],
    authors: [{ name: "Retro Deck Team" }],
    viewport: "width=device-width, initial-scale=1",
    robots: "index, follow",
  };
}

export default function RootLayout({
  children,
  params: { locale },
}: LayoutProps): React.JSX.Element {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              component="header"
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                backdropFilter: "blur(10px)",
                position: "sticky",
                top: 0,
                zIndex: 1100,
              }}
            >
              <Container maxWidth="lg">
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ py: 2 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background:
                        "linear-gradient(135deg, #ff6ec7 0%, #00e5ff 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Retro Deck
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </Stack>
                </Stack>
              </Container>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flex: 1 }}>
              {children}
            </Box>

            {/* Footer */}
            <Box
              component="footer"
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                mt: 8,
              }}
            >
              <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Retro Deck
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.7, maxWidth: 400 }}
                      >
                        Discover the ultimate retro gaming experience with our
                        curated collection of classic games.
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Platform
                        </Typography>
                        <Stack spacing={0.5}>
                          <Link
                            href="#"
                            variant="body2"
                            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                          >
                            NES
                          </Link>
                          <Link
                            href="#"
                            variant="body2"
                            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                          >
                            SNES
                          </Link>
                          <Link
                            href="#"
                            variant="body2"
                            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                          >
                            Genesis
                          </Link>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Company
                        </Typography>
                        <Stack spacing={0.5}>
                          <Link
                            href="#"
                            variant="body2"
                            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                          >
                            About
                          </Link>
                          <Link
                            href="#"
                            variant="body2"
                            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                          >
                            Blog
                          </Link>
                          <Link
                            href="#"
                            variant="body2"
                            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                          >
                            Careers
                          </Link>
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      pt: 3,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      © 2024 Retro Deck. Built with Next.js, Material-UI, and
                      Bun.
                    </Typography>
                  </Box>
                </Stack>
              </Container>
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
