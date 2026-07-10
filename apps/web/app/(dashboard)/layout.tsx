import { Navbar } from "~/components/layout/navbar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-screen-2xl px-4 py-6">{children}</main>
    </div>
  );
}
