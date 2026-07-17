import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

// Distinct display face for headings — the friendlier, more distinctive
// pairing partner to Inter's body text, kept to a single weight axis
// (variable font) so it's still one network request.
const headingFont = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
});

const bodyFont = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'BucketBoard',
    template: '%s | BucketBoard',
  },
  description: 'Community-favourite products, and where to buy them.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}>
        <body className="flex min-h-full flex-col">
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
