"use client";

import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { createAppTheme } from "./create-app-theme";

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export function ThemeProviderWrapper({
  children,
}: ThemeProviderWrapperProps): React.JSX.Element {
  const { theme } = useTheme();
  const muiTheme = useMemo(
    () => createAppTheme(theme === "dark" ? "dark" : "light"),
    [theme],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
