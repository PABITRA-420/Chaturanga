import { DepartmentTeam, TeamPlayer, DepartmentCode } from '@/types/teamPairing';

export const DEFAULT_JGEC_TEAMS: DepartmentTeam[] = [
  {
    id: 'team-jgec-cse',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    captain_name: 'Arpan Chakraborty',
    captain_contact: 'arpan.cse@jgec.ac.in',
    seed_rating: 1820,
    roster: [
      { id: 'cse-b1', name: 'Arpan Chakraborty', rating: 1950, board_number: 1, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-b2', name: 'Subham Ghosh', rating: 1870, board_number: 2, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-b3', name: 'Priyanka Das', rating: 1780, board_number: 3, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-b4', name: 'Debjyoti Sen', rating: 1680, board_number: 4, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-res1', name: 'Anik Paul', rating: 1620, board_number: 5, is_reserve: true, department_code: 'CSE' },
      { id: 'cse-res2', name: 'Sneha Roy', rating: 1550, board_number: 6, is_reserve: true, department_code: 'CSE' },
    ],
  },
  {
    id: 'team-jgec-it',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'IT',
    department_name: 'Information Technology',
    captain_name: 'Rohan Banerjee',
    captain_contact: 'rohan.it@jgec.ac.in',
    seed_rating: 1790,
    roster: [
      { id: 'it-b1', name: 'Rohan Banerjee', rating: 1910, board_number: 1, is_reserve: false, department_code: 'IT' },
      { id: 'it-b2', name: 'Souvik Karmakar', rating: 1840, board_number: 2, is_reserve: false, department_code: 'IT' },
      { id: 'it-b3', name: 'Aditi Saha', rating: 1750, board_number: 3, is_reserve: false, department_code: 'IT' },
      { id: 'it-b4', name: 'Kuntal Dutta', rating: 1660, board_number: 4, is_reserve: false, department_code: 'IT' },
      { id: 'it-res1', name: 'Tanmoy Barman', rating: 1590, board_number: 5, is_reserve: true, department_code: 'IT' },
    ],
  },
  {
    id: 'team-jgec-ece',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'ECE',
    department_name: 'Electronics & Communication',
    captain_name: 'Sayan Majumder',
    captain_contact: 'sayan.ece@jgec.ac.in',
    seed_rating: 1750,
    roster: [
      { id: 'ece-b1', name: 'Sayan Majumder', rating: 1880, board_number: 1, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-b2', name: 'Manojit Mondal', rating: 1810, board_number: 2, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-b3', name: 'Riya Mukherjee', rating: 1710, board_number: 3, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-b4', name: 'Sourav Roy', rating: 1600, board_number: 4, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-res1', name: 'Bitan Sarkar', rating: 1530, board_number: 5, is_reserve: true, department_code: 'ECE' },
    ],
  },
  {
    id: 'team-jgec-ee',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'EE',
    department_name: 'Electrical Engineering',
    captain_name: 'Avishek Das',
    captain_contact: 'avishek.ee@jgec.ac.in',
    seed_rating: 1720,
    roster: [
      { id: 'ee-b1', name: 'Avishek Das', rating: 1850, board_number: 1, is_reserve: false, department_code: 'EE' },
      { id: 'ee-b2', name: 'Sandip Ghosh', rating: 1770, board_number: 2, is_reserve: false, department_code: 'EE' },
      { id: 'ee-b3', name: 'Rupak Dey', rating: 1680, board_number: 3, is_reserve: false, department_code: 'EE' },
      { id: 'ee-b4', name: 'Swagata Pal', rating: 1580, board_number: 4, is_reserve: false, department_code: 'EE' },
      { id: 'ee-res1', name: 'Prasenjit Roy', rating: 1510, board_number: 5, is_reserve: true, department_code: 'EE' },
    ],
  },
  {
    id: 'team-jgec-me',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'ME',
    department_name: 'Mechanical Engineering',
    captain_name: 'Indranil Roy',
    captain_contact: 'indranil.me@jgec.ac.in',
    seed_rating: 1700,
    roster: [
      { id: 'me-b1', name: 'Indranil Roy', rating: 1830, board_number: 1, is_reserve: false, department_code: 'ME' },
      { id: 'me-b2', name: 'Joyjit Sen', rating: 1740, board_number: 2, is_reserve: false, department_code: 'ME' },
      { id: 'me-b3', name: 'Abhijit Saha', rating: 1650, board_number: 3, is_reserve: false, department_code: 'ME' },
      { id: 'me-b4', name: 'Suman Mondal', rating: 1580, board_number: 4, is_reserve: false, department_code: 'ME' },
      { id: 'me-res1', name: 'Dipankar Das', rating: 1500, board_number: 5, is_reserve: true, department_code: 'ME' },
    ],
  },
  {
    id: 'team-jgec-ce',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'CE',
    department_name: 'Civil Engineering',
    captain_name: 'Tuhin Chatterjee',
    captain_contact: 'tuhin.ce@jgec.ac.in',
    seed_rating: 1670,
    roster: [
      { id: 'ce-b1', name: 'Tuhin Chatterjee', rating: 1790, board_number: 1, is_reserve: false, department_code: 'CE' },
      { id: 'ce-b2', name: 'Anirban Bhowmick', rating: 1710, board_number: 2, is_reserve: false, department_code: 'CE' },
      { id: 'ce-b3', name: 'Subhadeep Paul', rating: 1620, board_number: 3, is_reserve: false, department_code: 'CE' },
      { id: 'ce-b4', name: 'Niladri Sarkar', rating: 1560, board_number: 4, is_reserve: false, department_code: 'CE' },
      { id: 'ce-res1', name: 'Rajib Roy', rating: 1480, board_number: 5, is_reserve: true, department_code: 'CE' },
    ],
  },
];

// In-memory team registry
const teamRegistry = new Map<string, DepartmentTeam>();

// Initialize with defaults
DEFAULT_JGEC_TEAMS.forEach(team => {
  teamRegistry.set(team.id, { ...team, roster: [...team.roster] });
});

const STORAGE_KEY_PREFIX = 'chaturanga_teams_';

/**
 * Get all registered teams for a tournament
 */
export function getTeams(tournamentId: string): DepartmentTeam[] {
  // Sync from browser localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_PREFIX + tournamentId);
      if (stored) {
        const parsed: DepartmentTeam[] = JSON.parse(stored);
        parsed.forEach(t => teamRegistry.set(t.id, t));
      }
    } catch (e) {
      console.warn('Could not read teams from localStorage', e);
    }
  }

  const results: DepartmentTeam[] = [];
  teamRegistry.forEach(team => {
    if (team.tournament_id === tournamentId || tournamentId === 'all') {
      results.push(team);
    }
  });

  return results.length > 0 ? results : DEFAULT_JGEC_TEAMS.filter(t => t.tournament_id === tournamentId || tournamentId === 'all');
}

/**
 * Get a specific team by its ID
 */
export function getTeam(teamId: string): DepartmentTeam | undefined {
  return teamRegistry.get(teamId);
}

/**
 * Save or update a team in the registry
 */
export function saveTeam(team: DepartmentTeam): DepartmentTeam {
  const updated: DepartmentTeam = {
    ...team,
    updated_at: new Date().toISOString(),
  };
  teamRegistry.set(team.id, updated);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const allForTourn = getTeams(team.tournament_id);
      window.localStorage.setItem(STORAGE_KEY_PREFIX + team.tournament_id, JSON.stringify(allForTourn));
    } catch (e) {
      console.warn('Could not persist teams to localStorage', e);
    }
  }

  return updated;
}

/**
 * Update the roster of players for a specific team
 */
export function updateRoster(teamId: string, roster: TeamPlayer[]): DepartmentTeam | undefined {
  const team = teamRegistry.get(teamId);
  if (!team) return undefined;

  const updated: DepartmentTeam = {
    ...team,
    roster,
    updated_at: new Date().toISOString(),
  };

  teamRegistry.set(teamId, updated);
  return updated;
}

/**
 * Reset team registry to pristine seed state (primarily for tests)
 */
export function resetTeamRegistry(): void {
  teamRegistry.clear();
  DEFAULT_JGEC_TEAMS.forEach(team => {
    teamRegistry.set(team.id, { ...team, roster: [...team.roster] });
  });
}
