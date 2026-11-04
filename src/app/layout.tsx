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
  weight: ['700', '900'],
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '600'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  weight: ['400', '700'],
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
  authors: [
    { name: 'Chaturanga JGEC Tech & Arbiter Team', url: 'https://chaturangajgec.netlify.app/team' },
  ],
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
    'JGEC Mind Sports',
  ],
  creator: 'Chaturanga JGEC',
  publisher: 'Jalpaiguri Government Engineering College',
  category: 'sports',
  alternates: {
    canonical: 'https://chaturangajgec.netlify.app',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://chaturangajgec.netlify.app',
    siteName: 'CHATURANGA • JGEC Chess Club',
    title: 'CHATURANGA • Premier Collegiate Chess Championship & Community',
    description: 'Official Chess Club of Jalpaiguri Government Engineering College. Register for collegiate championships, track pairings, and download digital tickets.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Chaturanga JGEC Chess Club Arena',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHATURANGA • JGEC Chess Club',
    description: 'Official Chess Club of Jalpaiguri Government Engineering College. Register for collegiate championships & live pairings.',
    images: ['/opengraph-image'],
    creator: '@chaturangajgec',
    site: '@chaturangajgec',
  },
  manifest: '/manifest.webmanifest',
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

import MobileNavigation from '@/components/MobileNavigation';
import ClientOverlays from '@/components/ui/ClientOverlays';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsClub',
        '@id': 'https://chaturangajgec.netlify.app/#organization',
        name: 'CHATURANGA JGEC Chess Club',
        alternateName: ['Chaturanga Chess Club', 'JGEC Chess Club', 'Chaturanga North Bengal'],
        url: 'https://chaturangajgec.netlify.app',
        logo: 'https://chaturangajgec.netlify.app/icon.svg',
        image: 'https://chaturangajgec.netlify.app/opengraph-image',
        sport: 'Chess',
        description: 'Official Chess Club of Jalpaiguri Government Engineering College. Organizing certified Swiss championships, blitz arenas, and cultivating collegiate grandmasters since 2012.',
        foundingDate: '2012',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Jalpaiguri Government Engineering College, NH 31D',
          addressLocality: 'Jalpaiguri',
          addressRegion: 'West Bengal',
          postalCode: '735102',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 26.5448,
          longitude: 88.7188,
        },
        memberOf: {
          '@type': 'EducationalOrganization',
          name: 'Jalpaiguri Government Engineering College',
          url: 'https://jgec.ac.in',
        },
        sameAs: [
          'https://facebook.com',
          'https://instagram.com',
          'https://youtube.com',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://chaturangajgec.netlify.app/#website',
        url: 'https://chaturangajgec.netlify.app',
        name: 'CHATURANGA JGEC',
        publisher: {
          '@id': 'https://chaturangajgec.netlify.app/#organization',
        },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://chaturangajgec.netlify.app/upcoming?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${poppins.variable} ${inter.variable} ${robotoMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14] pb-16 md:pb-0">
        {/* WCAG Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D4AF7C] focus:text-[#0B0F14] focus:rounded-xl focus:font-bold focus:shadow-2xl focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <ClientOverlays />
        <MobileNavigation />
      </body>
    </html>
  );
}
