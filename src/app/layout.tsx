import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Project Ascend — Sistema Operacional de Evolução Pessoal',
  description:
    'SaaS de produtividade, missões hierárquicas, planejamento diário e gamificação RPG sem inteligência artificial.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#090a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#090a0f] text-gray-100 antialiased min-h-screen selection:bg-indigo-600 selection:text-white">
        <PwaRegister />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
