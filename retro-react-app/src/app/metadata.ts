import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ [key: string]: string | string[] }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = Array.isArray(resolvedParams.locale) ? resolvedParams.locale[0] : resolvedParams.locale;
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
