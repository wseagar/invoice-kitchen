import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const TITLE = 'Invoice Kitchen - Free Invoice Builder';
const DESCRIPTION =
  'Free and easy professional invoice builder. Cook up a beautiful invoice in seconds. Built by experts at getting freelancers and small businesses paid.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'invoice, template, invoice kitchen, invoice template, invoice builder, free invoice',
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://invoice.kitchen',
    images: 'https://invoice.kitchen/og.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: 'https://invoice.kitchen/og.png',
    site: '@invoice_kitchen',
    creator: '@invoice_kitchen',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
