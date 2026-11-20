import type { Metadata } from "next";
import StoreProvider from "@/store/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workspace Manager — Project & Task Management",
  description:
    "A production-quality workspace, project, and task management application with Kanban boards, calendars, real-time collaboration, and more.",
  keywords: ["workspace", "project management", "task management", "kanban", "productivity"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
