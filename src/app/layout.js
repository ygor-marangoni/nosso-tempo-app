import { Covered_By_Your_Grace, Figtree } from 'next/font/google';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import Providers from '@/components/Providers';
import '../../style.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nosso-tempo.vercel.app';
const faviconVersion = '20260402';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
});

const cursive = Covered_By_Your_Grace({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-cursive',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nosso Tempo',
    template: '%s | Nosso Tempo',
  },
  description: 'O SaaS do casal para registrar momentos, memórias, fotos e marcos em um espaço privado a dois.',
  applicationName: 'Nosso Tempo',
  keywords: ['casal', 'relacionamento', 'memórias', 'álbum', 'linha do tempo', 'diário do casal', 'saas'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    title: 'Nosso Tempo',
    description: 'Criem o espaço privado de vocês para guardar memórias, fotos e momentos especiais.',
    siteName: 'Nosso Tempo',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Nosso Tempo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nosso Tempo',
    description: 'O espaço privado do casal para registrar memórias, marcos e fotos juntos.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [{ url: `/favicon.svg?v=${faviconVersion}`, type: 'image/svg+xml', sizes: 'any' }],
    shortcut: [`/favicon.svg?v=${faviconVersion}`],
    apple: [`/favicon.svg?v=${faviconVersion}`],
  },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Aplica o tema salvo antes do React montar — evita flash no loading screen */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=localStorage.getItem('nt_palette');if(p)document.documentElement.dataset.palette=p;}catch(e){}`,
          }}
        />
      </head>
      <body className={`${figtree.variable} ${cursive.variable}`} suppressHydrationWarning>
        {gaId && <GoogleAnalytics trackingId={gaId} />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
