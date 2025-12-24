import { getRequestConfig } from "next-intl/server";
import type enMessages from "./messages/en.json";

type Messages = typeof enMessages;

export default getRequestConfig(
  async ({ locale }): Promise<{ messages: Messages }> => ({
    messages: (await import(`./messages/${locale}.json`)).default,
  }),
);
