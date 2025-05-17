import React from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Placeholder for app-specific layout elements like a sub-navbar or sidebar if needed */}
      {children}
    </div>
  );
}
