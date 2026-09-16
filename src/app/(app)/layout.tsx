import { Suspense } from "react";

import type { Media } from "@/lib/core/types/payload-types";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnalyticsLayout } from "@/components/layout/analytics";
import Footer from "@/components/layout/footer";
import Head from "@/components/layout/head";
import HeaderWrapper from "@/components/layout/header-wrapper";
import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import Providers from "@/lib/providers";
import { generateMetadataLayout } from "@/lib/seo/metadata";

import "@/lib/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await DAL.querySiteSettings();
    return generateMetadataLayout(settings);
  } catch (e) {
    console.error("Failed to generate metadata:", e);
    return {
      metadataBase: new URL(appConfig.BASE_URL || "http://localhost:3344"),
      title: appConfig.SITE_NAME,
      description: "Padel & Tennis Store",
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let settings: any = null;
  try {
    settings = await DAL.querySiteSettings();
  } catch (e) {
    console.error("Failed to load site settings:", e);
  }

  const logo = settings?.home?.logo as Media | undefined;
  const footer = settings?.footer;

  return (
    <html
      lang={appConfig.LOCAL.lang}
      dir={appConfig.LOCAL.dir}
      suppressHydrationWarning
    >
      <Head />
      <body>
        <AnalyticsLayout />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="layout-container flex flex-1 flex-col">
              <Suspense
                fallback={
                  <div className="relative z-20 max-h-17 border-b md:px-18" />
                }
              >
                {/* ✅ الهيدر دايمًا يتعرض */}
                <HeaderWrapper logo={logo} />
              </Suspense>

              <main className="flex-1">{children}</main>
              <Footer footer={footer} />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}