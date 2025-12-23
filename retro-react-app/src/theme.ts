import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff6ec7" },
    secondary: { main: "#00e5ff" },
    background: {
      default: "#050510",
      paper: "#101020",
    },
  },
  typography: {
    fontFamily: [
      '"Press Start 2P"',
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(", "),
    h2: { letterSpacing: "0.06em" },
    button: { textTransform: "none" },
  },
  shape: { borderRadius: 10 },
});

export default theme;
