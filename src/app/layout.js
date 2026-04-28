import "./globals.css";

export const metadata = {
  title: "SyferSec Lab Console",
  description: "Local cybersecurity lab dashboard with Nmap scanning.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
