import { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: "Meeting Rooms — Front",
  description: "A simple app to manage meeting rooms and reservations.",
};

export default function RootLayout({ children }: { children: ReactNode }) {

  return (
    <html lang="fr">
      <body suppressHydrationWarning={true}>
        <div className="container">
          <h1 className="h1" style={{ marginBottom: 24 }}>Meeting Rooms — Front</h1>
          <nav className="nav" style={{ marginBottom: 24 }}>
            <Link href="/" style={{ marginRight: 12 }}>Dashboard</Link>
            <Link href="/rooms" style={{ marginRight: 12 }}>Salles</Link>
            <Link href="/reservations">Reservations</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
