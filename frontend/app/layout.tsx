import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const metadata = {
  title: "Math Research OS",
  description: "Research workspace for advanced mathematics"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
