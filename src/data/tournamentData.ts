export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  targetDate: string; // ISO string for countdown
  time: string;
  venue: string;
  format: string;
  prizePool: string;
  slots: string;
  isFeatured: boolean; // Nearest event is featured (colorful + countdown)
  description: string;
}

export interface PastEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  format: string;
  totalParticipants: number;
  podium: {
    rank: string;
    name: string;
    dept: string;
    score: string;
    prize: string;
  }[];
  summary: string;
  results: {
    rank: number;
    name: string;
    idNumber: string;
    dept: string;
    score: string;
    tieBreak: string;
  }[];
}

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "inter-college-2026",
    title: "Inter-College Chess Tournament 2026",
    date: "November 07, 2026",
    targetDate: "2026-11-07T09:30:00",
    time: "09:30 AM – 06:00 PM IST",
    venue: "Main Auditorium, JGEC Campus",
    format: "7 Rounds Swiss System • Rapid (15m + 10s)",
    prizePool: "₹25,000 + Trophies",
    slots: "128 Max (42 Registered)",
    isFeatured: true,
    description: "The premier collegiate chess championship of North Bengal. Open for students across engineering and collegiate institutions with digital clock setups and broadcast live boards."
  },
  {
    id: "state-rapid-2026",
    title: "State Rapid Chess Championship Leg",
    date: "December 12, 2026",
    targetDate: "2026-12-12T10:00:00",
    time: "10:00 AM – 07:00 PM IST",
    venue: "Indoor Sports Complex, JGEC",
    format: "6 Rounds Rapid (25m + 10s) • FIDE Rated",
    prizePool: "₹40,000 Cash Pool",
    slots: "64 Slots (Filling Fast)",
    isFeatured: false,
    description: "Official FIDE-rated Rapid circuit leg organized in association with the North Bengal Chess Federation. Standard electronic clocks and international arbiters."
  },
  {
    id: "annual-blitz-2027",
    title: "Annual Blitz Knockout Derby",
    date: "January 15, 2027",
    targetDate: "2027-01-15T15:00:00",
    time: "03:00 PM – 08:30 PM IST",
    venue: "Student Activity Centre (SAC) Hall 1",
    format: "9 Double-Rounds (3m + 2s Blitz Arena)",
    prizePool: "₹15,000 + Medals",
    slots: "Open for all batches",
    isFeatured: false,
    description: "Fast-paced, adrenaline-filled blitz derby open to beginner, intermediate, and advanced players. Sudden death playoffs for top 4 finishers."
  }
];

export const PAST_EVENTS: PastEvent[] = [
  {
    id: "autumn-swiss-2025",
    title: "Autumn Swiss Cup 2025",
    date: "September 18, 2025",
    time: "10:00 AM – 06:30 PM",
    venue: "Main Auditorium, JGEC Campus",
    format: "7 Rounds Swiss (15m + 10s)",
    totalParticipants: 84,
    podium: [
      { rank: "1st (Gold)", name: "Aniket Roy", dept: "CSE 4th Year", score: "6.5 / 7.0", prize: "₹10,000 + Champion Cup" },
      { rank: "2nd (Silver)", name: "Ritwick Paul", dept: "ECE 4th Year", score: "6.0 / 7.0", prize: "₹6,000 + Silver Shield" },
      { rank: "3rd (Bronze)", name: "Suman Sen", dept: "ME 3rd Year", score: "5.5 / 7.0", prize: "₹4,000 + Bronze Trophy" }
    ],
    summary: "Aniket Roy secured the tournament victory undefeated after a decisive tactical rook sacrifice in round 7 against Ritwick Paul.",
    results: [
      { rank: 1, name: "Aniket Roy", idNumber: "JGEC-22101", dept: "CSE", score: "6.5", tieBreak: "29.5" },
      { rank: 2, name: "Ritwick Paul", idNumber: "JGEC-22145", dept: "ECE", score: "6.0", tieBreak: "28.0" },
      { rank: 3, name: "Suman Sen", idNumber: "JGEC-23112", dept: "ME", score: "5.5", tieBreak: "26.5" },
      { rank: 4, name: "Priya Das", idNumber: "JGEC-23189", dept: "IT", score: "5.0", tieBreak: "25.0" },
      { rank: 5, name: "Debjyoti Bose", idNumber: "JGEC-24102", dept: "EE", score: "4.5", tieBreak: "24.0" },
      { rank: 6, name: "Sneha Mukherjee", idNumber: "JGEC-23140", dept: "CE", score: "4.5", tieBreak: "22.5" },
      { rank: 7, name: "Abhirup Ghosh", idNumber: "JGEC-24155", dept: "ECE", score: "4.0", tieBreak: "21.0" },
      { rank: 8, name: "Rahul Karmakar", idNumber: "JGEC-22180", dept: "IT", score: "4.0", tieBreak: "20.5" }
    ]
  },
  {
    id: "grand-blitz-2025",
    title: "Grand Blitz Summer Derby 2025",
    date: "June 22, 2025",
    time: "02:00 PM – 07:30 PM",
    venue: "Student Activity Centre (Room 204)",
    format: "Arena Knockout (3m + 2s)",
    totalParticipants: 64,
    podium: [
      { rank: "1st (Gold)", name: "Suman Sen", dept: "ME 3rd Year", score: "Finals 3 - 1", prize: "₹8,000 + Blitz Shield" },
      { rank: "2nd (Silver)", name: "Aniket Roy", dept: "CSE 4th Year", score: "Finals 1 - 3", prize: "₹4,000 + Silver Medal" },
      { rank: "3rd (Bronze)", name: "Abhirup Ghosh", dept: "ECE 2nd Year", score: "Playoff Win", prize: "₹2,500 + Bronze Medal" }
    ],
    summary: "Over 190 intense blitz games played in 5 hours. Suman Sen capitalized on time pressure in endgame scramble to win the finals 3-1.",
    results: [
      { rank: 1, name: "Suman Sen", idNumber: "JGEC-23112", dept: "ME", score: "9.0", tieBreak: "32.0" },
      { rank: 2, name: "Aniket Roy", idNumber: "JGEC-22101", dept: "CSE", score: "8.5", tieBreak: "31.0" },
      { rank: 3, name: "Abhirup Ghosh", idNumber: "JGEC-24155", dept: "ECE", score: "7.0", tieBreak: "27.5" },
      { rank: 4, name: "Ritwick Paul", idNumber: "JGEC-22145", dept: "ECE", score: "6.5", tieBreak: "26.0" },
      { rank: 5, name: "Priya Das", idNumber: "JGEC-23189", dept: "IT", score: "6.0", tieBreak: "24.5" }
    ]
  },
  {
    id: "north-bengal-2025",
    title: "North Bengal Inter-Tech Cup",
    date: "February 10, 2025",
    time: "09:00 AM – 08:00 PM",
    venue: "Indoor Sports Complex & Gymnasium",
    format: "Team Classical 4 Boards (45m + 30s)",
    totalParticipants: 48,
    podium: [
      { rank: "1st (Gold)", name: "Team JGEC", dept: "Host College Squad", score: "Match Pts: 10/10", prize: "₹20,000 + Championship Cup" },
      { rank: "2nd (Silver)", name: "Siliguri Inst. of Tech (SIT)", dept: "Guest Squad", score: "Match Pts: 8/10", prize: "₹10,000 + Silver Cup" },
      { rank: "3rd (Bronze)", name: "Cooch Behar Govt Engg (CGEC)", dept: "Guest Squad", score: "Match Pts: 6/10", prize: "₹5,000 + Bronze Cup" }
    ],
    summary: "Host team JGEC swept the collegiate championship without dropping a single round, defending their title for the second consecutive year.",
    results: [
      { rank: 1, name: "Team JGEC", idNumber: "JGEC-SQUAD", dept: "All Branches", score: "10.0", tieBreak: "38.0" },
      { rank: 2, name: "SIT Siliguri", idNumber: "SIT-TEAM", dept: "External", score: "8.0", tieBreak: "33.0" },
      { rank: 3, name: "CGEC Cooch Behar", idNumber: "CGEC-TEAM", dept: "External", score: "6.0", tieBreak: "29.0" },
      { rank: 4, name: "Jalpaiguri Polytechnic", idNumber: "JPC-TEAM", dept: "External", score: "4.0", tieBreak: "24.0" }
    ]
  }
];
