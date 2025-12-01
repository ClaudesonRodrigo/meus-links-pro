// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// AQUI ESTÁ A MUDANÇA: Atualizamos o title e description
export const metadata: Metadata = {
  title: "Meus Links Pro - Seus links em um só lugar",
  description: "Crie sua página de links personalizada e compartilhe com o mundo.",
  icons: {
    icon: '/favicon.ico', // Garante que o navegador busque o ícone certo
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Mantendo em Português do Brasil como configuramos antes
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}