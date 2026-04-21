import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import en from "../messages/en.json";
import hi from "../messages/hi.json";
import ml from "../messages/ml.json";
import { routing } from "./routing";

const messages = { en, hi, ml };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});
