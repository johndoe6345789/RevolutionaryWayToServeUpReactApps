import { Box, Typography, List, ListItemButton, ListItemText } from "@mui/material";
import type { HeadingItem } from "@/lib/markdown-headings";

interface TableOfContentsProps {
  headings: HeadingItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings.length) return null;

  return (
    <Box
      component="nav"
      aria-label="Table of contents"
      sx={{
        width: 280,
        borderLeft: "1px solid",
        borderColor: "divider",
        display: { xs: "none", lg: "block" },
        position: "sticky",
        top: 0,
        maxHeight: "100vh",
        overflowY: "auto",
        bgcolor: "background.paper",
        p: 2,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        On this page
      </Typography>
      <List dense>
        {headings.map((heading) => (
          <ListItemButton
            key={heading.id}
            component="a"
            href={`#${heading.id}`}
            sx={{
              pl: heading.level > 2 ? (heading.level - 1) * 2 : 2,
              borderLeft: "2px solid",
              borderColor: "transparent",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <ListItemText
              primaryTypographyProps={{ variant: "body2" }}
              primary={heading.title}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
