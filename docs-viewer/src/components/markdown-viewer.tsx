"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box,
  Chip,
  Divider,
  Link,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import type { HeadingItem } from "@/lib/markdown-headings";
import type { DocLinkTarget } from "@/lib/doc-links";
import { findDocLink } from "@/lib/doc-links";

interface MarkdownViewerProps {
  content: string;
  title?: string;
  headings: HeadingItem[];
  onNavigateDoc?: (sectionId: string, fileId: string) => void;
}

export function MarkdownViewer({
  content,
  title,
  headings,
  onNavigateDoc,
}: MarkdownViewerProps): React.JSX.Element {
  const wikiReadyContent = useMemo(
    () => content.replace(/\[\[([^\]]+)\]\]/g, "[$1](doc:$1)"),
    [content]
  );

  let headingRenderIndex = 0;

  const handleDocLink = (target?: DocLinkTarget) => (event: React.MouseEvent) => {
    if (!target || !onNavigateDoc) return;
    event.preventDefault();
    onNavigateDoc(target.sectionId, target.fileId);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        bgcolor: "background.paper",
        borderRadius: 2,
        maxWidth: "100%",
        "& h1": {
          color: "primary.main",
          fontSize: "2.5rem",
          fontWeight: 700,
          mb: 3,
          mt: 2,
        },
        "& h2": {
          color: "primary.main",
          fontSize: "2rem",
          fontWeight: 600,
          mb: 2,
          mt: 3,
          borderBottom: "2px solid",
          borderColor: "primary.main",
          pb: 1,
        },
        "& h3": {
          color: "secondary.main",
          fontSize: "1.5rem",
          fontWeight: 600,
          mb: 2,
          mt: 2.5,
        },
        "& h4": {
          fontSize: "1.25rem",
          fontWeight: 600,
          mb: 1.5,
          mt: 2,
          color: "text.primary",
        },
        "& p": {
          mb: 2,
          lineHeight: 1.7,
          color: "text.primary",
        },
        "& ul, & ol": {
          mb: 2,
          pl: 3,
        },
        "& li": {
          mb: 1,
          lineHeight: 1.6,
        },
        "& code": {
          bgcolor: "grey.100",
          color: "error.main",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: "0.875rem",
          fontFamily: "monospace",
        },
        "& pre": {
          bgcolor: "grey.900",
          color: "grey.100",
          p: 2,
          borderRadius: 2,
          overflow: "auto",
          mb: 2,
          "& code": {
            bgcolor: "transparent",
            color: "inherit",
            px: 0,
            py: 0,
          },
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: 2,
          py: 1,
          bgcolor: "grey.50",
          fontStyle: "italic",
          mb: 2,
        },
        "& .footnotes": {
          borderTop: "1px solid",
          borderColor: "divider",
          mt: 4,
          pt: 2,
          "& ol": {
            pl: 3,
            mb: 0,
          },
          "& li": {
            mb: 1.5,
            lineHeight: 1.6,
          },
        },
        "& sup.footnote-ref": {
          fontSize: "0.75rem",
          ml: 0.25,
        },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          mb: 2,
          border: "1px solid",
          borderColor: "grey.300",
        },
        "& th, & td": {
          border: "1px solid",
          borderColor: "grey.300",
          px: 2,
          py: 1,
        },
        "& th": {
          bgcolor: "grey.100",
          fontWeight: 600,
        },
        "& a": {
          color: "primary.main",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      }}
    >
      {title != null ? (
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
      ) : null}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const headingId = headings[headingRenderIndex]?.id;
            headingRenderIndex += 1;

            return (
              <Typography id={headingId} variant="h2" component="h2">
                {children}
              </Typography>
            );
          },
          h2: ({ children }) => {
            const headingId = headings[headingRenderIndex]?.id;
            headingRenderIndex += 1;

            return (
              <Box id={headingId}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="h3" component="h3">
                  {children}
                </Typography>
              </Box>
            );
          },
          h3: ({ children }) => {
            const headingId = headings[headingRenderIndex]?.id;
            headingRenderIndex += 1;

            return (
              <Typography id={headingId} variant="h4" component="h4">
                {children}
              </Typography>
            );
          },
          h4: ({ children }) => {
            const headingId = headings[headingRenderIndex]?.id;
            headingRenderIndex += 1;

            return (
              <Typography id={headingId} variant="h5" component="h5">
                {children}
              </Typography>
            );
          },
          a: ({ href, children }) => {
            if (href?.startsWith("doc:")) {
              const label = href.replace("doc:", "");
              const target = findDocLink(label);
              const isUnresolved = target == null;

              return (
                <Tooltip title={isUnresolved ? "Document not found" : "Navigate"}>
                  <span>
                    <Link
                      component="button"
                      color={isUnresolved ? "text.secondary" : "primary"}
                      onClick={handleDocLink(target)}
                      underline="hover"
                      sx={{
                        cursor: isUnresolved ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {children}
                      <Chip
                        size="small"
                        label={isUnresolved ? "missing" : target?.title ?? "link"}
                        color={isUnresolved ? "default" : "secondary"}
                        variant="outlined"
                      />
                    </Link>
                  </span>
                </Tooltip>
              );
            }

            return (
              <Link href={href} underline="hover">
                {children}
              </Link>
            );
          },
        }}
      >
        {wikiReadyContent}
      </ReactMarkdown>
    </Paper>
  );
}
