import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editor de Santinho",
  description: "Preencha os números diretamente no santinho e baixe a imagem.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
