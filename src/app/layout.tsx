import type { Metadata, Viewport } from 'next';
import { Montserrat, Poppins, Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0F14',
  viewportFit: 'cover',
};

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chaturangajgec.netlify.app'),
  title: {
    default: 'CHATURANGA • Premier JGEC Chess Club & Tournament Arena',
    template: '%s | CHATURANGA JGEC',
  },
  description: 'Official Chess Club of Jalpaiguri Government Engineering College. Register for collegiate Swiss rapid championships, view real-time Elo leaderboards, and download official tournament passes.',
  applicationName: 'Chaturanga JGEC',
  authors: [{ name: 'Chaturanga JGEC Tech & Arbiter Team' }],
  keywords: [
    'Chaturanga',
    'JGEC Chess Club',
    'Jalpaiguri Government Engineering College',
    'North Bengal Chess',
    'Inter-College Chess Championship',
    'Swiss Rapid Chess Tournament',
    'FIDE Chess WB',
    'Collegiate Chess Championship',
    'Live Chess Leaderboard',
    'Chess Tournament Registration',
  ],
  creator: 'Chaturanga JGEC',
  publisher: 'Jalpaiguri Government Engineering College',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://chaturangajgec.netlify.app',
    siteName: 'CHATURANGA • JGEC Chess Club',
    title: 'CHATURANGA • Premier Collegiate Chess Championship & Community',
    description: 'Official Chess Club of Jalpaiguri Government Engineering College. Register for collegiate championships, track pairings, and download digital tickets.',
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 630,
        alt: 'Chaturanga JGEC Chess Club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHATURANGA • JGEC Chess Club',
    description: 'Official Chess Club of Jalpaiguri Government Engineering College. Register for collegiate championships & live pairings.',
    images: ['/hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: 'CHATURANGA JGEC Chess Club',
    alternateName: 'Chaturanga Chess Club',
    url: 'https://chaturanga-jgec.ac.in',
    sport: 'Chess',
    description: 'Official Chess Club of Jalpaiguri Government Engineering College. Managing collegiate FIDE tournaments, Swiss rapid championships, and Elo leaderboards.',
    location: {
      '@type': 'Place',
      name: 'Jalpaiguri Government Engineering College',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jalpaiguri',
        addressRegion: 'West Bengal',
        postalCode: '735102',
        addressCountry: 'IN',
      },
    },
    memberOf: {
      '@type': 'EducationalOrganization',
      name: 'Jalpaiguri Government Engineering College',
    },
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${montserrat.variable} ${poppins.variable} ${inter.variable} ${robotoMono.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
        {/* WCAG Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D4AF7C] focus:text-[#0B0F14] focus:rounded-xl focus:font-bold focus:shadow-2xl focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
