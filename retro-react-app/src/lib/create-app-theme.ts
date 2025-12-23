import type { Theme } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

// Retro gaming color palette
const retroColors = {
  primary: {
    main: "#ff6ec7", // Hot pink
    light: "#ff99d6",
    dark: "#c9409a",
  },
  secondary: {
    main: "#00e5ff", // Cyan
    light: "#33eaff",
    dark: "#00b2cc",
  },
  accent: {
    main: "#ffd54f", // Yellow
    light: "#ffdd71",
    dark: "#c8a415",
  },
  background: {
    default: "#050510",
    paper: "#101020",
    alt: "#080820",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.5)",
  },
  divider: "rgba(255, 255, 255, 0.12)",
};

const lightRetroColors = {
  primary: {
    main: "#c9409a", // Darker pink
    light: "#ff6ec7",
    dark: "#9c0d6b",
  },
  secondary: {
    main: "#00b2cc", // Darker cyan
    light: "#00e5ff",
    dark: "#0088a3",
  },
  accent: {
    main: "#c8a415", // Darker yellow
    light: "#ffd54f",
    dark: "#8d7200",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
    alt: "#e8e8e8",
  },
  text: {
    primary: "#050510",
    secondary: "rgba(5, 5, 16, 0.7)",
    disabled: "rgba(5, 5, 16, 0.5)",
  },
  divider: "rgba(5, 5, 16, 0.12)",
};

export function createAppTheme(mode: "light" | "dark"): Theme {
  const colors = mode === "dark" ? retroColors : lightRetroColors;

  return createTheme({
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      text: colors.text,
      divider: colors.divider,
    },
    typography: {
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      h1: {
        fontSize: "3.5rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      },
      h2: {
        fontSize: "2.5rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      },
      h3: {
        fontSize: "2rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.6,
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
      },
      caption: {
        fontSize: "0.75rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            padding: "12px 24px",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(255, 110, 199, 0.3)"
                : "0 4px 20px rgba(201, 64, 154, 0.3)",
            "&:hover": {
              boxShadow:
                mode === "dark"
                  ? "0 6px 30px rgba(255, 110, 199, 0.4)"
                  : "0 6px 30px rgba(201, 64, 154, 0.4)",
            },
          },
          contained: {
            background:
              mode === "dark"
                ? "linear-gradient(135deg, #ff6ec7 0%, #00e5ff 100%)"
                : "linear-gradient(135deg, #c9409a 0%, #00b2cc 100%)",
            color: mode === "dark" ? "#050510" : "#ffffff",
            "&:hover": {
              background:
                mode === "dark"
                  ? "linear-gradient(135deg, #ff99d6 0%, #33eaff 100%)"
                  : "linear-gradient(135deg, #ff6ec7 0%, #00e5ff 100%)",
            },
          },
          outlined: {
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            border: `1px solid ${colors.divider}`,
            borderRadius: 16,
            boxShadow:
              mode === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                : "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          },
          colorPrimary: {
            backgroundColor: mode === "dark" ? "#ff6ec720" : "#c9409a20",
            color: mode === "dark" ? "#ff6ec7" : "#c9409a",
          },
          colorSecondary: {
            backgroundColor: mode === "dark" ? "#00e5ff20" : "#00b2cc20",
            color: mode === "dark" ? "#00e5ff" : "#00b2cc",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background:
              mode === "dark"
                ? "radial-gradient(circle at 0% 0%, #ff6ec720 0, transparent 55%), radial-gradient(circle at 100% 100%, #00e5ff20 0, transparent 55%), linear-gradient(135deg, #050510 0, #080820 35%, #050510 100%)"
                : "linear-gradient(135deg, #f5f5f5 0, #e8e8e8 100%)",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
          },
        },
      },
    },
  });
}
