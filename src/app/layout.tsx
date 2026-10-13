import type { Metadata } from 'next';
import { Montserrat, Poppins, Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

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
  title: 'CHATURANGA • JGEC Chess Club',
  description: 'Official Chess Club of Jalpaiguri Government Engineering College. Organizing and managing chess events, tournaments and collegiate community activities.',
  icons: {
    icon: '/favicon.svg',
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
