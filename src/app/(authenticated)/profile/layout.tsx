export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout without sidebar for profile setup/status pages
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

