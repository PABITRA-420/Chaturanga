import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RegistrationWizard from '@/components/register/RegistrationWizard';

describe('RegistrationWizard Component', () => {
  const mockOnStepChange = vi.fn();
  const mockOnSelectEvent = vi.fn();
  const mockOnFieldChange = vi.fn();
  const mockOnCustomAnswerChange = vi.fn();
  const mockOnVerifyChess = vi.fn().mockResolvedValue({ exists: true, username: 'testuser' });
  const mockOnSubmit = vi.fn();

  const sampleEvents = [
    {
      id: 'inter-college-2026',
      title: 'JGEC Inter-College Championship 2026',
      date: 'November 07, 2026',
      time: '10:00 AM – 06:00 PM IST',
      venue: 'Main Auditorium, JGEC Campus',
      format: '7 Rounds Swiss System • Rapid (15m + 10s)',
      status: 'open',
      slots: '128 Max Slots',
      maxSlots: 128,
      registeredCount: 40,
      customFields: [
        { id: 'stay', label: 'Hostel Stay Required', type: 'select', required: true, options: ['Yes', 'No'] }
      ]
    }
  ];

  const sampleFormData = {
    fullName: 'Pritam Sarkar',
    rollNumber: '23101104050',
    institution: 'Jalpaiguri Government Engineering College',
    department: 'Electrical Engineering',
    year: '3rd Year',
    email: 'pritam@jgec.ac.in',
    phone: '9876543299',
    chessPlatform: 'chesscom' as const,
    chessUsername: 'pritam_chess',
    fideId: '',
    ratingCategory: 'Intermediate / Rated (1600 - 1900)',
    acceptTerms: true
  };

  const defaultProps = {
    currentStep: 1,
    onStepChange: mockOnStepChange,
    events: sampleEvents,
    selectedEventId: 'inter-college-2026',
    onSelectEvent: mockOnSelectEvent,
    formData: sampleFormData,
    onFieldChange: mockOnFieldChange,
    customAnswers: { stay: 'Yes' },
    onCustomAnswerChange: mockOnCustomAnswerChange,
    onVerifyChess: mockOnVerifyChess,
    chessVerification: {
      checking: false,
      hasChecked: true,
      lastCheckedHandle: 'pritam_chess',
      lastCheckedPlatform: 'chesscom',
      result: { exists: true, platform: 'Chess.com', username: 'pritam_chess' }
    },
    isFieldEnabled: () => true,
    isFieldRequired: () => true,
    onSubmit: mockOnSubmit,
    isSubmitting: false,
    errorMsg: '',
    duplicateTicket: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stepper indicators and Step 1 event cards initially', () => {
    render(<RegistrationWizard {...defaultProps} currentStep={1} />);

    expect(screen.getByText('Select Tournament Event (1 Available)')).toBeInTheDocument();
    expect(screen.getAllByText('JGEC Inter-College Championship 2026').length).toBeGreaterThan(0);
    expect(screen.getByText('Live Digital Pass Preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Credentials/i })).toBeInTheDocument();
  });

  it('renders Step 2 (Personal Credentials) when currentStep is 2', () => {
    render(<RegistrationWizard {...defaultProps} currentStep={2} />);

    expect(screen.getByText('Player Credentials')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pritam Sarkar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('23101104050')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Chess Profile/i })).toBeInTheDocument();
  });

  it('renders Step 3 (Chess Skill & Profile) when currentStep is 3', () => {
    render(<RegistrationWizard {...defaultProps} currentStep={3} />);

    expect(screen.getByText('Chess Skill & Online Account Verification')).toBeInTheDocument();
    expect(screen.getByText('Select Chess Platform *')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pritam_chess')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review & Pledge/i })).toBeInTheDocument();
  });

  it('renders Step 4 (Review & Terms) and triggers onSubmit', () => {
    render(<RegistrationWizard {...defaultProps} currentStep={4} />);

    expect(screen.getByText('Registration Summary')).toBeInTheDocument();
    expect(screen.getByText('Hostel Stay Required')).toBeInTheDocument();
    expect(screen.getByText(/FIDE Fair-Play & Swiss System Agreement/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Submit & Generate Entry Pass/i });
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('switches step when step indicator button is clicked', () => {
    render(<RegistrationWizard {...defaultProps} currentStep={1} />);

    const step3Button = screen.getByRole('button', { name: /Chess/i });
    fireEvent.click(step3Button);

    expect(mockOnStepChange).toHaveBeenCalledWith(3);
  });
});
