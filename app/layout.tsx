import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analiza Tehnica si Calitativa Companii",
  description:
    "Proiect educational de analiza tehnica si calitativa a companiilor listate la bursa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
