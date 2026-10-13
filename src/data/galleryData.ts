export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Tournaments' | 'Awards' | 'Blitz Night' | 'Club Room';
  date: string;
  tournamentName: string;
  description: string;
  imageSrc: string;
  aspect: 'landscape' | 'portrait' | 'square';
  tag: string;
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'gal-1',
    title: 'Final Round Board 1 Clash • Annual Championship 2025',
    category: 'Tournaments',
    date: 'November 2025',
    tournamentName: 'Chaturanga Annual Championship 2025',
    description: 'A tense Queen and Pawn endgame deciding the JGEC College Champion on Board 1 with 120 spectators observing.',
    imageSrc: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    aspect: 'landscape',
    tag: 'Championship'
  },
  {
    id: 'gal-2',
    title: 'Trophy Presentation by Principal & Chief Arbiter',
    category: 'Awards',
    date: 'November 2025',
    tournamentName: 'Chaturanga Annual Championship 2025',
    description: 'Champion Aritra Sen receiving the rolling gold cup and cash scholarship from IA Dr. P. K. Sen.',
    imageSrc: 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=1200&q=80',
    aspect: 'landscape',
    tag: 'Medal & Trophy'
  },
  {
    id: 'gal-3',
    title: 'Midnight Blitz Arena • 3+2 Sudden Death',
    category: 'Blitz Night',
    date: 'January 2026',
    tournamentName: 'New Year Midnight Blitz 2026',
    description: '32 students battling across 5 rounds of high-octane 3-minute blitz under the auditorium lights.',
    imageSrc: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=1200&q=80',
    aspect: 'square',
    tag: 'Blitz'
  },
  {
    id: 'gal-4',
    title: 'Tactics & Opening Theory in Room 204',
    category: 'Club Room',
    date: 'February 2026',
    tournamentName: 'Weekly Club Masterclass',
    description: 'Club seniors breaking down Kasparov’s immortal Queen sacrifice on the demonstration magnetic board.',
    imageSrc: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=1200&q=80',
    aspect: 'landscape',
    tag: 'Analysis'
  },
  {
    id: 'gal-5',
    title: 'Main Hall Panorama: 64 Boards in Simultaneous Play',
    category: 'Tournaments',
    date: 'October 2025',
    tournamentName: 'Inter-College Invitational 2025',
    description: 'Over 120 collegiate players from North Bengal engineering colleges competing in Round 4.',
    imageSrc: 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=1200&q=80',
    aspect: 'landscape',
    tag: '64 Boards'
  },
  {
    id: 'gal-6',
    title: 'Best Female Player Award & Runner-Up Podium',
    category: 'Awards',
    date: 'October 2025',
    tournamentName: 'Inter-College Invitational 2025',
    description: 'Sayanika Roy and Debanjan Ghosh honored on stage by the Sports Secretary with commemorative shields.',
    imageSrc: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    aspect: 'square',
    tag: 'Podium'
  }
];
