import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floe - Personal Productivity Platform",
  description: "Transform your productivity with Floe's pomodoro timer, task management, and intelligent scheduling.",
  keywords: "productivity, pomodoro, task management, calendar, deep work, focus timer",
  authors: [{ name: "Floe Team" }],
  openGraph: {
    title: "Floe - Personal Productivity Platform",
    description: "Transform your productivity with Floe's pomodoro timer, task management, and intelligent scheduling.",
    type: "website",
    url: "https://members.getfloe.app",
    siteName: "Floe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
