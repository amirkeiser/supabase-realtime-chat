export default function ProfileSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clean layout without sidebar for profile setup/status pages
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

