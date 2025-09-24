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
          <h1 className="h1">Meeting Rooms — Front</h1>
          <nav className="nav">
            <Link href="/">Dashboard</Link>
            <Link href="/rooms">Salles</Link>
            <Link href="/reservations">Reservations</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
