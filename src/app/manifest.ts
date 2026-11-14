import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CHATURANGA • JGEC Chess Club & Tournament Arena',
    short_name: 'Chaturanga JGEC',
    description: 'Official Chess Club of Jalpaiguri Government Engineering College. Live Swiss pairings, Elo ratings, and tournament passes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#09090B',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  };
}
