"use client";

import { LanguageProvider } from "@/services/i18n";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
