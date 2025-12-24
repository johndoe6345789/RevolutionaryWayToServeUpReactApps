import { getRequestConfig } from "next-intl/server";

type Messages = typeof import("./messages/en.json");

export default getRequestConfig(
  async ({ locale }): Promise<{ messages: Messages }> => ({
    messages: (await import(`./messages/${locale}.json`)).default,
  }),
);
