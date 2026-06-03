import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'PlayZone - Play & Relax',
  description: 'A premium collection of relaxing mini-games built with React and Next.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
