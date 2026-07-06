import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { GamificationWrapper } from "@/components/providers/GamificationWrapper";
import { AppShell } from "@/components/layout/AppShell";
import AuthModal from "@/components/auth/AuthModal";
import Script from "next/script";
import { LanguageProvider } from "@/services/i18n";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0e17",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "Otaku Gildija — The Spatial Anime Platform",
    template: "%s | Otaku Gildija",
  },
  description:
    "Experience anime like never before. An immersive WebXR environment featuring a 3D library, spatial Visual Novel studio, and gamified community. Built by otakus, for otakus.",
  keywords: [
    "anime",
    "library",
    "visual novel",
    "WebXR",
    "spatial computing",
    "AR",
    "VR",
    "metaverse",
    "community",
    "gamification",
  ],
  authors: [{ name: "Otaku Nexus Network" }],
  creator: "Otaku Nexus Network",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Otaku Gildija",
    title: "Otaku Gildija — The Spatial Anime Platform",
    description:
      "Dive into a fully immersive WebXR anime platform. Spatial library, VR quests, and AR summons. One platform, infinite adventures.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otaku Gildija — The Spatial Anime Platform",
    description:
      "Dive into a fully immersive WebXR anime platform. Spatial library, VR quests, and AR summons.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased dark font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Script src="/live2dcubismcore.min.js" strategy="beforeInteractive" />
        <Script src="/live2d.min.js" strategy="beforeInteractive" />
        <AuthProvider>
          <LanguageProvider>
            <GamificationWrapper>
              <AppShell>{children}</AppShell>
              <AuthModal />
            </GamificationWrapper>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
