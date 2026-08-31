import { getRequestConfig } from "next-intl/server";

import en from "./en.json";
import ar from "./ar.json";

import appConfig from "@/lib/core/config";

type Messages = typeof en;

export const messages: Messages = appConfig.LOCAL.lang === "ar" ? ar : en;

export default getRequestConfig(() => ({
  locale: appConfig.LOCAL.lang,
  messages,
}));