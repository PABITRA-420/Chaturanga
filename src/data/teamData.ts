export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: 'core' | 'coordinator' | 'mentor';
  department: string;
  year: string;
  elo: string;
  fideId?: string | null;
  bio: string;
  responsibilities: string[];
  favoriteOpening: string;
  achievements: string[];
  chessPiece: 'King' | 'Queen' | 'Rook' | 'Bishop' | 'Knight';
  avatarColor: string;
  titleBadge: string;
  imageUrl?: string | null;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "aniket-roy",
    name: "Aniket Roy",
    role: "President & Head Arbiter",
    category: "core",
    department: "Computer Science & Engineering",
    year: "4th Year",
    elo: "2085 FIDE",
    fideId: "25048112",
    bio: "Leading the chess club's competitive operations and institutional collaborations. State Rapid finalist and collegiate championship gold medalist.",
    responsibilities: [
      "Overseeing collegiate tournament operations and FIDE arbiter alignments",
      "Mentoring club team for inter-college championships",
      "Coordinating with college administration and sports board"
    ],
    favoriteOpening: "Sicilian Defense (Najdorf Variation)",
    achievements: [
      "Winner - Autumn Swiss Cup 2025",
      "Gold Board 1 - North Bengal Inter-Tech Cup",
      "FIDE Arbiter Certified - Level 3"
    ],
    chessPiece: 'King',
    avatarColor: 'from-[#D4AF7C] via-[#E6C98A] to-[#B89355]',
    titleBadge: 'Club President',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "ritwick-paul",
    name: "Ritwick Paul",
    role: "Vice President & Tournament Director",
    category: "core",
    department: "Electronics & Communication Engg",
    year: "4th Year",
    elo: "2010 FIDE",
    fideId: "25061904",
    bio: "Head of tournament logistics and Swiss pairings software. Passionate positional player specializing in deep endgame grinds.",
    responsibilities: [
      "Directing round pairings using Swiss-Manager systems",
      "Organizing weekly Stockfish analysis and blitz arenas",
      "Managing live DGT electronic broadcast board streams"
    ],
    favoriteOpening: "Queen's Gambit Declined (Tartakower)",
    achievements: [
      "Runner-Up - Autumn Swiss Cup 2025",
      "Finalist - Bengal State Collegiate Derby",
      "Senior Arbiter - JGEC Annual Circuit"
    ],
    chessPiece: 'Queen',
    avatarColor: 'from-amber-400 to-yellow-600',
    titleBadge: 'Tournament Director',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "suman-sen",
    name: "Suman Sen",
    role: "Technical Lead & Blitz Captain",
    category: "core",
    department: "Mechanical Engineering",
    year: "3rd Year",
    elo: "1890 Elo",
    bio: "Tactical wizard and aggressive attacking player. Directs the club's technical platform, rating leaderboard, and puzzle challenge workshops.",
    responsibilities: [
      "Maintaining digital club leaderboards & player ratings",
      "Curating weekly grandmaster endgame studies and puzzle sets",
      "Leading collegiate blitz knockout arenas"
    ],
    favoriteOpening: "King's Indian Defense (Mar del Plata)",
    achievements: [
      "Champion - Grand Blitz Summer Derby 2025",
      "Winner - North Bengal Speed Cup",
      "Puzzle Rush Club Record: 54 in 5 mins"
    ],
    chessPiece: 'Rook',
    avatarColor: 'from-blue-500 to-indigo-700',
    titleBadge: 'Blitz Captain',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "priya-das",
    name: "Priya Das",
    role: "Events Head & Community Lead",
    category: "core",
    department: "Information Technology",
    year: "3rd Year",
    elo: "1945 Elo",
    bio: "Leading event outreach, registration workflows, and beginner discovery clinics. Passionate about collegiate female participation in competitive chess.",
    responsibilities: [
      "Coordinating player onboarding and registration desks",
      "Hosting 'Women in Chess' discovery sessions & mentorship",
      "Public relations, prize distribution, and arbiter coordination"
    ],
    favoriteOpening: "Caro-Kann Defense (Classical)",
    achievements: [
      "4th Place - Autumn Swiss Cup 2025",
      "Captain - JGEC Women's Collegiate Team",
      "Community Organizer of the Year 2025"
    ],
    chessPiece: 'Bishop',
    avatarColor: 'from-purple-500 to-pink-600',
    titleBadge: 'Events Head',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "debjyoti-bose",
    name: "Debjyoti Bose",
    role: "Equipment & Logistics Coordinator",
    category: "coordinator",
    department: "Electrical Engineering",
    year: "2nd Year",
    elo: "1720 Elo",
    bio: "Manages club room equipment, Staunton tournament sets, and digital timers for all university sessions.",
    responsibilities: [
      "Inventory of weighted tournament boards and DGT clocks",
      "Club Room 204 open hours management",
      "Venue setup for flagship tournaments"
    ],
    favoriteOpening: "Ruy Lopez (Berlin Defense)",
    achievements: [
      "Top 5 - Autumn Swiss Cup 2025",
      "Best Junior Player - JGEC Intra 2024"
    ],
    chessPiece: 'Knight',
    avatarColor: 'from-emerald-500 to-teal-700',
    titleBadge: 'Logistics Head',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "sneha-mukherjee",
    name: "Sneha Mukherjee",
    role: "Outreach & Communications Lead",
    category: "coordinator",
    department: "Civil Engineering",
    year: "2nd Year",
    elo: "1680 Elo",
    bio: "Handles social media announcements, player spotlight stories, and tournament photography.",
    responsibilities: [
      "Publishing round summaries and highlight photos",
      "Managing club Discord and communications",
      "Coordinating with campus media club"
    ],
    favoriteOpening: "French Defense (Winawer)",
    achievements: [
      "6th Place - Autumn Swiss Cup 2025",
      "Inter-College Qualifier Participant"
    ],
    chessPiece: 'Bishop',
    avatarColor: 'from-rose-500 to-red-700',
    titleBadge: 'Outreach Lead',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "abhirup-ghosh",
    name: "Abhirup Ghosh",
    role: "Ratings & Pairings Coordinator",
    category: "coordinator",
    department: "Electronics & Communication Engg",
    year: "2nd Year",
    elo: "1810 Elo",
    bio: "Handles tiebreak calculations, pairing displays, and verification of collegiate credentials.",
    responsibilities: [
      "Buchholz and Sonneborn-Berger verification",
      "Live score displays in the tournament hall",
      "Assisting chief arbiters in round transitions"
    ],
    favoriteOpening: "English Opening (Botvinnik System)",
    achievements: [
      "3rd Place - Grand Blitz Summer Derby 2025",
      "Rising Star Award 2025"
    ],
    chessPiece: 'Rook',
    avatarColor: 'from-cyan-500 to-blue-700',
    titleBadge: 'Pairings Coordinator',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: "dr-subhasis-saha",
    name: "Dr. S. Saha",
    role: "Faculty Advisor & Grand Patron",
    category: "mentor",
    department: "Department of Computer Science & Engg",
    year: "Faculty",
    elo: "Former State Senior Representative",
    bio: "Longstanding faculty mentor supporting mental sports and cognitive tactical training at JGEC for over a decade.",
    responsibilities: [
      "Institutional patron and administrative oversight",
      "Academic alignment with university sports committee",
      "Official representation in state collegiate federations"
    ],
    favoriteOpening: "Queen's Indian Defense",
    achievements: [
      "Founding Faculty Mentor - CHATURANGA.JGEC",
      "Patron for 15+ State & Collegiate Championships"
    ],
    chessPiece: 'King',
    avatarColor: 'from-amber-600 via-orange-600 to-yellow-700',
    titleBadge: 'Faculty Advisor',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
  }
];
