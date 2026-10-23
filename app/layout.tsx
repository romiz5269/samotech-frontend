import type {Metadata} from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SAMOTECH | Technology & Security",
  description: "زیرساخت، امنیت و توسعه نرم‌افزار در یک تیم واحد.",
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
