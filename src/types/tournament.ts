export type TournamentStatus = 'open' | 'upcoming' | 'closing_soon' | 'closed' | 'live' | 'completed';

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
  enabled: boolean;
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface TournamentPodiumItem {
  rank: string;
  name: string;
  dept: string;
  score: string;
  prize: string;
}

export interface TournamentStandingResult {
  rank: number;
  name: string;
  idNumber: string;
  dept: string;
  score: string;
  tieBreak: string;
}

export interface Tournament {
  id: string;
  title: string;
  date: string;
  targetDate: string;
  time: string;
  venue: string;
  format: string;
  prizePool: string;
  slots: string;
  maxSlots: number;
  registeredCount: number;
  isFeatured: boolean;
  isVisible?: boolean;
  description: string;
  status: TournamentStatus;
  
  // Registration controls
  registrationStartDate?: string;
  registrationEndDate?: string;
  entryFee?: string;
  arbiterName?: string;
  contactEmail?: string;
  contactPhone?: string;
  fairPlayNotice?: string;

  // Custom Form Builder
  formConfig: FormFieldConfig[];
  customFields?: CustomField[];

  // Completed tournament data (if moved to past)
  isPast?: boolean;
  totalParticipants?: number;
  summary?: string;
  podium?: TournamentPodiumItem[];
  results?: TournamentStandingResult[];

  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  {
    id: 'fullName',
    label: 'Full Legal Name',
    type: 'text',
    enabled: true,
    required: true,
    placeholder: 'e.g. Viswanathan Anand',
    helpText: 'Official name as recognized in college ID or FIDE records'
  },
  {
    id: 'rollNumber',
    label: 'College / University Roll No.',
    type: 'text',
    enabled: true,
    required: true,
    placeholder: 'e.g. 23101104018',
    helpText: 'College identity card roll number for arbiter validation'
  },
  {
    id: 'institution',
    label: 'Institution / College',
    type: 'text',
    enabled: true,
    required: true,
    placeholder: 'e.g. Jalpaiguri Government Engineering College',
    helpText: 'Host or visiting collegiate affiliation'
  },
  {
    id: 'department',
    label: 'Department / Branch',
    type: 'text',
    enabled: true,
    required: true,
    placeholder: 'e.g. Computer Science & Engineering',
    helpText: 'Academic discipline'
  },
  {
    id: 'year',
    label: 'Academic Year',
    type: 'select',
    enabled: true,
    required: true,
    options: ['1st Year (Freshers)', '2nd Year', '3rd Year', '4th Year (Final Year)', 'Postgraduate / Alumni / Guest'],
    helpText: 'Year of study for category awards'
  },
  {
    id: 'email',
    label: 'Official Email Address',
    type: 'email',
    enabled: true,
    required: true,
    placeholder: 'e.g. player@jgec.ac.in',
    helpText: 'For pairings, timetable notices, and ticket PDF delivery'
  },
  {
    id: 'phone',
    label: 'WhatsApp / Mobile Number',
    type: 'tel',
    enabled: true,
    required: true,
    placeholder: 'e.g. 9876543210',
    helpText: 'Direct mobile number for emergency arbiter notices'
  },
  {
    id: 'chessUsername',
    label: 'Chess.com / Lichess Handle',
    type: 'text',
    enabled: true,
    required: false,
    placeholder: 'e.g. JGEC_Grandmaster',
    helpText: 'Optional online handle to verify rapid rating track record'
  },
  {
    id: 'fideId',
    label: 'Official FIDE ID',
    type: 'text',
    enabled: true,
    required: false,
    placeholder: 'e.g. 5029411 (or leave blank if unrated)',
    helpText: 'Required only for FIDE rated sections; leave blank if unrated'
  },
  {
    id: 'ratingCategory',
    label: 'Player Rating Category',
    type: 'select',
    enabled: true,
    required: true,
    options: [
      'Beginner / Casual (< 1200)',
      'Club Player (1200 - 1600)',
      'Intermediate / Rated (1600 - 1900)',
      'Advanced / FIDE Master (> 1900)'
    ],
    helpText: 'Seed bracket calculation for Swiss system initial pairing'
  },
  {
    id: 'acceptTerms',
    label: 'Fair Play & FIDE Regulation Adherence',
    type: 'checkbox',
    enabled: true,
    required: true,
    helpText: 'Adherence to FIDE anti-cheating guidelines and zero-tolerance policy'
  }
];

export interface Participant {
  id: string;
  ticketId: string;
  name: string;
  rollNumber: string;
  college: string;
  department: string;
  year?: string;
  email?: string;
  phone?: string;
  ratingCategory: string;
  chessPlatform?: string | null;
  chessUsername: string;
  fideId: string;
  registeredAt: string;
  verified: boolean;
  checkInStatus: 'registered' | 'confirmed' | 'checked_in';
  tournamentId: string;
  tournament: string;
  customAnswers?: Record<string, string>;
}

