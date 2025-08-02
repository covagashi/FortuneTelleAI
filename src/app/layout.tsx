// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SplashScreen } from "@/components/splash-screen";
import { LanguageProvider } from "@/hooks/use-language";

export const metadata: Metadata = {
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <head>
        <meta name="theme-color" content="#120c18" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <div className="absolute inset-0 z-[-1] bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <SplashScreen />
        <SidebarProvider>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </LanguageProvider>
  );
}
