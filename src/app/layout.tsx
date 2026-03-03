import type { Metadata } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import AppThemeProvider from "@/components/AppThemeProvider";
import SkipLink from "@/components/SkipLink";

const firaSans = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "AccessiMind: Vision Accessibility Analyst",
  description: "AI-powered accessibility analysis for screen recordings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={firaSans.className} suppressHydrationWarning>
        <AppThemeProvider>
          <SkipLink />
          <main id="main-content">
            {children}
          </main>
        </AppThemeProvider>
      </body>
    </html>
  );
}
