import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TournamentFormModal, { TournamentFormModalProps } from '@/components/admin/TournamentFormModal';
import { Tournament } from '@/types/tournament';

describe('TournamentFormModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockOnDraftChange = vi.fn();

  const sampleTournament: Tournament = {
    id: 'spring-rapid-2026',
    title: 'JGEC Spring Rapid 2026',
    date: 'April 20, 2026',
    targetDate: '2026-04-20T10:00:00.000Z',
    time: '10:00 AM – 05:00 PM IST',
    venue: 'Civil Seminar Hall',
    format: '5 Rounds Swiss System',
    prizePool: '₹15,000',
    slots: '64 Max Slots',
    maxSlots: 64,
    registeredCount: 30,
    isFeatured: true,
    isVisible: true,
    description: 'Annual Spring Rapid collegiate chess battle.',
    status: 'open',
    registrationStartDate: '2026-03-01',
    registrationEndDate: '2026-04-18',
    entryFee: 'Free',
    arbiterName: 'IA R. Bose',
    contactEmail: 'arbiter@jgec.ac.in',
    contactPhone: '9876543210',
    fairPlayNotice: 'FIDE Fair Play rules enforced.',
    formConfig: [
      { id: 'fullName', label: 'Full Legal Name', type: 'text', enabled: true, required: true },
      { id: 'rollNumber', label: 'College Roll No.', type: 'text', enabled: true, required: true }
    ],
    customFields: [
      { id: 'tshirt', label: 'T-Shirt Size', type: 'select', required: true, options: ['M', 'L', 'XL'] }
    ],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <TournamentFormModal
        isOpen={false}
        editingTournament={null}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal in creation mode when editingTournament is null', () => {
    render(
      <TournamentFormModal
        isOpen={true}
        editingTournament={null}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Create New Tournament')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Tournament' })).toBeInTheDocument();
    expect(screen.getByText('1. Basic Info & Venue')).toBeInTheDocument();
  });

  it('renders modal in edit mode with prefilled tournament details', () => {
    render(
      <TournamentFormModal
        isOpen={true}
        editingTournament={sampleTournament}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/Edit Tournament: JGEC Spring Rapid 2026/i)).toBeInTheDocument();
    const titleInput = screen.getByDisplayValue('JGEC Spring Rapid 2026');
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByDisplayValue('Civil Seminar Hall')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('switches between tabs and displays respective section fields', () => {
    render(
      <TournamentFormModal
        isOpen={true}
        editingTournament={sampleTournament}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Switch to Tab 2: Registration Schedule
    fireEvent.click(screen.getByText(/2. Registration Schedule/i));
    expect(screen.getByText('Registration Status')).toBeInTheDocument();
    expect(screen.getByText('Feature this tournament on homepage hero ticker')).toBeInTheDocument();

    // Switch to Tab 3: Form Builder & Fields
    fireEvent.click(screen.getByText(/3. Form Builder & Fields/i));
    expect(screen.getByText('Standard Participant Fields')).toBeInTheDocument();
    expect(screen.getByText('Custom Tournament Questions')).toBeInTheDocument();
    expect(screen.getByText('T-Shirt Size')).toBeInTheDocument();

    // Switch to Tab 4: Arbiter & Rules
    fireEvent.click(screen.getByText(/4. Arbiter & Rules/i));
    expect(screen.getByText('Chief Arbiter / Coordinator')).toBeInTheDocument();
    expect(screen.getByDisplayValue('IA R. Bose')).toBeInTheDocument();
  });

  it('allows adding and removing custom questions in the Form Builder tab', () => {
    render(
      <TournamentFormModal
        isOpen={true}
        editingTournament={sampleTournament}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDraftChange={mockOnDraftChange}
      />
    );

    // Navigate to Form tab
    fireEvent.click(screen.getByText(/3. Form Builder & Fields/i));

    // Click "Add Question"
    fireEvent.click(screen.getByText('Add Question'));
    expect(screen.getByText('Question Prompt')).toBeInTheDocument();

    // Fill in question prompt
    const promptInput = screen.getByPlaceholderText(/Do you require campus hostel stay/i);
    fireEvent.change(promptInput, { target: { value: 'Hostel Accommodation Needed' } });

    // Click "Add Field"
    fireEvent.click(screen.getByText('Add Field'));

    // Verify new question appears in custom questions list
    expect(screen.getByText('Hostel Accommodation Needed')).toBeInTheDocument();

    // Remove the newly added question
    const removeButtons = screen.getAllByLabelText(/Remove question/i);
    fireEvent.click(removeButtons[removeButtons.length - 1]);

    expect(screen.queryByText('Hostel Accommodation Needed')).not.toBeInTheDocument();
  });

  it('calls onSave when form is submitted with required fields', async () => {
    render(
      <TournamentFormModal
        isOpen={true}
        editingTournament={sampleTournament}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const titleInput = screen.getByDisplayValue('JGEC Spring Rapid 2026');
    fireEvent.change(titleInput, { target: { value: 'JGEC Spring Rapid 2026 - Updated' } });

    const submitButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'JGEC Spring Rapid 2026 - Updated'
        })
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('triggers onClose when Cancel button or modal close button is clicked', () => {
    render(
      <TournamentFormModal
        isOpen={true}
        editingTournament={sampleTournament}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
