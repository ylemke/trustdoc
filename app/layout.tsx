import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { ConditionalTopNav } from '@/components/ConditionalTopNav';

export const metadata: Metadata = {
  title: 'TrustDoc — AI Accountability',
  description: 'Human Decision Records for AI-assisted workflows',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFA]">
        <Providers>
          <ConditionalTopNav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
