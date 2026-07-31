import { getRequestConfig } from "next-intl/server";
import type enMessages from "./messages/en.json";

type Messages = typeof enMessages;

export default getRequestConfig(
  async ({ locale }): Promise<{ locale: string; messages: Messages }> => {
    const resolvedLocale = locale ?? "en";

    return {
      locale: resolvedLocale,
      messages: (await import(`./messages/${resolvedLocale}.json`)).default,
    };
  },
);
