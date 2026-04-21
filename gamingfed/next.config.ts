import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local API static uploads (e.g. /uploads/gallery/...) in development
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
      // Azure Blob Storage (primary media host). Matches any storage account
      // under *.blob.core.windows.net so switching accounts doesn't require
      // a config change.
      { protocol: "https", hostname: "**.blob.core.windows.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

const config = withNextIntl(nextConfig) as NextConfig;

/**
 * `next dev` (Turbopack) must resolve `next-intl/config` to `i18n/request.ts`.
 * If the alias is missing, imports hit the package stub and throw:
 * "Couldn't find next-intl config file".
 *
 * The plugin sometimes attaches aliases under `experimental.turbo` only; Next 16
 * reads stable `turbopack`, so we merge both and pin an absolute path.
 */
/** Must stay relative — Turbopack does not support absolute `resolveAlias` targets here. */
const requestConfigRel = "./i18n/request.ts";

config.turbopack = {
  ...config.turbopack,
  resolveAlias: {
    ...config.turbopack?.resolveAlias,
    "next-intl/config": requestConfigRel,
  },
};

export default config;
