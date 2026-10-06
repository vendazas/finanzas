import "./globals.css";
import PwaRegister from "@/components/pwa/PwaRegister";

export const metadata = {
  title: "MiPlata | Finanzas personales",
  description: "Controla tus finanzas personales en un solo lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
