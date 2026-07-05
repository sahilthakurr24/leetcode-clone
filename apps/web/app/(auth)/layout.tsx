export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // LeetCode's auth screens are always light, regardless of app theme.
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10">
      {children}
    </div>
  );
}
