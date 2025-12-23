"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import type { SelectChangeEvent } from "@mui/material";
import { MenuItem, Select, FormControl } from "@mui/material";
import { useTransition } from "react";

export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (event: SelectChangeEvent<string>): void => {
    const newLocale = event.target.value;
    startTransition(() => {
      // Remove the current locale from pathname and add the new one
      const segments = pathname.split("/");
      segments[1] = newLocale; // Replace the locale segment
      const newPathname = segments.join("/");
      router.push(newPathname);
    });
  };

  return (
    <FormControl size="small" sx={{ minWidth: 80 }}>
      <Select
        value={locale}
        onChange={handleLanguageChange}
        disabled={isPending}
        sx={{
          "& .MuiSelect-select": {
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid",
            borderColor: "divider",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "primary.main",
          },
        }}
      >
        <MenuItem value="en">EN</MenuItem>
        <MenuItem value="es">ES</MenuItem>
      </Select>
    </FormControl>
  );
}
