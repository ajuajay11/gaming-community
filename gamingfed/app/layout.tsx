import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root layout is a pass-through; `<html>` / `<body>` live in
 * `app/[locale]/layout.tsx` so we can set `lang` per locale (next-intl).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
