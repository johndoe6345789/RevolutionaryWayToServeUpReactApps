import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { DocFile } from "@/types/docs";

interface DocPagerProps {
  previous?: DocFile;
  next?: DocFile;
  onNavigate: (sectionId: string, fileId: string) => void;
}

export function DocPager({ previous, next, onNavigate }: DocPagerProps) {
  if (!previous && !next) return null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}
    >
      <Box flex={1}>
        {previous ? (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => onNavigate(previous.section, previous.id)}
            sx={{ textAlign: "left" }}
          >
            <Typography variant="caption" component="div" color="text.secondary">
              Previous
            </Typography>
            <Typography variant="body2" fontWeight={600} component="div">
              {previous.title}
            </Typography>
          </Button>
        ) : null}
      </Box>

      <Box flex={1} textAlign="right">
        {next ? (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onNavigate(next.section, next.id)}
            sx={{ textAlign: "right" }}
          >
            <Box textAlign="right">
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
                sx={{ lineHeight: 1.2 }}
              >
                Next
              </Typography>
              <Typography variant="body2" fontWeight={600} component="div">
                {next.title}
              </Typography>
            </Box>
          </Button>
        ) : null}
      </Box>
    </Stack>
  );
}
