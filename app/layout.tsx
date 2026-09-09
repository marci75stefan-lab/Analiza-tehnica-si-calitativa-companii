import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: "Analiza Tehnica si Calitativa Companii",
  description:
    "Proiect educational de analiza tehnica si calitativa a companiilor listate la bursa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* Sets the dark class before first paint, avoiding a flash of the
            wrong theme - see lib/ThemeContext.tsx for why this is inlined. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
