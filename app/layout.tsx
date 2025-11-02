// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { UserProvider } from "./components/userContext";
import Navbar from "./components/Navbar"; // Asegurate de tener Navbar.tsx

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Casa de Deportes - Sistema de Gestión",
  description: "Sistema de gestión de productos para casa de deportes",
  keywords: "deportes, gestión, inventario, productos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <UserProvider>
          <Navbar /> {/* Navbar global */}
          <main>{children}</main> {/* Aquí se renderizan todas las páginas */}
        </UserProvider>
      </body>
    </html>
  );
}
