import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdminParticipantsTab from '@/components/admin/AdminParticipantsTab';
import { Tournament, Participant } from '@/types/tournament';

describe('AdminParticipantsTab Component', () => {
  const mockOnRefresh = vi.fn();
  const mockOnCheckIn = vi.fn().mockResolvedValue(undefined);
  const mockOnDeletePlayer = vi.fn().mockResolvedValue(undefined);
  const mockOnAddWalkIn = vi.fn().mockResolvedValue(true);

  const sampleTournaments: Tournament[] = [
    {
      id: 'inter-college-2026',
      title: 'JGEC Inter-College Championship 2026',
      date: 'November 07, 2026',
      targetDate: '2026-11-07T10:00:00.000Z',
      time: '10:00 AM – 06:00 PM IST',
      venue: 'Main Auditorium, JGEC Campus',
      format: '7 Rounds Swiss System • Rapid (15m + 10s)',
      prizePool: '₹25,000 + Trophies',
      slots: '128 Max Slots',
      maxSlots: 128,
      registeredCount: 45,
      isFeatured: true,
      description: 'The premier inter-college chess tournament in North Bengal.',
      status: 'open',
      formConfig: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    }
  ];

  const sampleParticipants: Participant[] = [
    {
      id: 'p-1',
      ticketId: 'CHTR-2026-001',
      name: 'Subhasis Debnath',
      rollNumber: '23101104018',
      college: 'Jalpaiguri Government Engineering College',
      department: 'Computer Science & Engineering',
      year: '2nd Year',
      email: 'subhasis@jgec.ac.in',
      phone: '9876543210',
      ratingCategory: 'Intermediate / Rated (1600 - 1900)',
      chessPlatform: 'chesscom',
      chessUsername: 'subhasis_chess',
      fideId: '5029411',
      registeredAt: '2026-02-01T12:00:00Z',
      verified: true,
      checkInStatus: 'checked_in',
      tournamentId: 'inter-college-2026',
      tournament: 'JGEC Inter-College Championship 2026',
      customAnswers: { hostel: 'Yes, need hostel' }
    },
    {
      id: 'p-2',
      ticketId: 'CHTR-2026-002',
      name: 'Ananya Roy',
      rollNumber: '23101102005',
      college: 'Siliguri Institute of Technology',
      department: 'Information Technology',
      year: '3rd Year',
      email: 'ananya@sit.ac.in',
      phone: '9876543211',
      ratingCategory: 'Club Player (1200 - 1600)',
      chessPlatform: 'lichess',
      chessUsername: 'ananya_knight',
      fideId: 'Unrated',
      registeredAt: '2026-02-02T14:30:00Z',
      verified: false,
      checkInStatus: 'confirmed',
      tournamentId: 'inter-college-2026',
      tournament: 'JGEC Inter-College Championship 2026'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders top capacity overview card and participants table headers', () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    expect(screen.getByText(/Concurrent Tournaments • Live Registration Operations/i)).toBeInTheDocument();
    expect(screen.getAllByText('JGEC Inter-College Championship 2026').length).toBeGreaterThan(0);

    expect(screen.getByText('Participant Details')).toBeInTheDocument();
    expect(screen.getByText('Institution & Dept')).toBeInTheDocument();
    expect(screen.getByText('Arbiter Desk Action')).toBeInTheDocument();
  });

  it('renders participant rows with details, ticket ID, and correct status badges', () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    // Participant 1: Checked In
    expect(screen.getByText('Subhasis Debnath')).toBeInTheDocument();
    expect(screen.getByText('CHTR-2026-001')).toBeInTheDocument();
    expect(screen.getByText(/Roll: 23101104018/i)).toBeInTheDocument();
    expect(screen.getByText('Revoke Desk')).toBeInTheDocument();

    // Participant 2: Awaiting Desk
    expect(screen.getByText('Ananya Roy')).toBeInTheDocument();
    expect(screen.getByText('CHTR-2026-002')).toBeInTheDocument();
    expect(screen.getByText(/Roll: 23101102005/i)).toBeInTheDocument();
    expect(screen.getByText('Check In Desk')).toBeInTheDocument();
  });

  it('filters participants based on search query', () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search player name, roll no, ticket ID/i);
    fireEvent.change(searchInput, { target: { value: 'Ananya' } });

    expect(screen.getByText('Ananya Roy')).toBeInTheDocument();
    expect(screen.queryByText('Subhasis Debnath')).not.toBeInTheDocument();
  });

  it('filters participants based on status button (Checked In vs Awaiting Desk)', () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    // Click "Checked In" status filter pill
    const checkedInFilter = screen.getByRole('button', { name: /Checked In \(1\)/i });
    fireEvent.click(checkedInFilter);

    expect(screen.getByText('Subhasis Debnath')).toBeInTheDocument();
    expect(screen.queryByText('Ananya Roy')).not.toBeInTheDocument();
  });

  it('triggers onCheckIn callback when Check In Desk button is clicked', async () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    const checkInBtn = screen.getByRole('button', { name: /Check In Desk/i });
    fireEvent.click(checkInBtn);

    await waitFor(() => {
      expect(mockOnCheckIn).toHaveBeenCalledWith('CHTR-2026-002', 'confirmed');
    });
  });

  it('opens and submits the manual walk-in registration modal', async () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    const walkInBtn = screen.getByRole('button', { name: /\+ Walk-in Registration/i });
    fireEvent.click(walkInBtn);

    expect(screen.getByText('Manual Arbiter Walk-in Registration')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('e.g. Rahul Sharma');
    fireEvent.change(nameInput, { target: { value: 'Pritam Sarkar' } });

    const rollInput = screen.getByPlaceholderText('e.g. 23101104018');
    fireEvent.change(rollInput, { target: { value: '23101104099' } });

    const submitBtn = screen.getByRole('button', { name: 'Register Walk-in Player' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnAddWalkIn).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pritam Sarkar',
          rollNumber: '23101104099'
        })
      );
    });
  });

  it('opens and closes custom Q&A inspector modal', () => {
    render(
      <AdminParticipantsTab
        tournaments={sampleTournaments}
        participants={sampleParticipants}
        onRefresh={mockOnRefresh}
        onCheckIn={mockOnCheckIn}
        onDeletePlayer={mockOnDeletePlayer}
        onAddWalkIn={mockOnAddWalkIn}
      />
    );

    const answersBtn = screen.getByRole('button', { name: /1 Answers/i });
    fireEvent.click(answersBtn);

    expect(screen.getByText('Custom Registration Answers')).toBeInTheDocument();
    expect(screen.getByText('Yes, need hostel')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Close Inspector' });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Custom Registration Answers')).not.toBeInTheDocument();
  });
});
