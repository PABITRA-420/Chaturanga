import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DigitalPassCard from '@/components/register/DigitalPassCard';
import * as canvasTicketModule from '@/lib/canvasTicket';

describe('DigitalPassCard Component', () => {
  const mockOnReset = vi.fn();
  const sampleFormData = {
    fullName: 'Rahul Sharma',
    rollNumber: '23101104018',
    institution: 'Jalpaiguri Government Engineering College',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    email: 'rahul@jgec.ac.in',
    phone: '9876543210',
    chessPlatform: 'chesscom',
    chessUsername: 'rahul_chess',
    fideId: '5029411',
    ratingCategory: 'Club Player (1200 - 1600)'
  };

  const sampleCurrentEvent = {
    title: 'JGEC Inter-College Championship 2026',
    date: 'November 07, 2026',
    time: '10:00 AM – 06:00 PM IST',
    venue: 'Main Auditorium, JGEC Campus'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accredited badge with ticket ID, player name, roll, and event title', () => {
    render(
      <DigitalPassCard
        ticketId="CHTR-2026-999"
        formData={sampleFormData}
        currentEvent={sampleCurrentEvent}
        sheetStatus={{ synced: true, configured: true }}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText(/You're Ready for/i)).toBeInTheDocument();
    expect(screen.getByText('CHTR-2026-999')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('23101104018')).toBeInTheDocument();
    expect(screen.getByText('JGEC Inter-College Championship 2026')).toBeInTheDocument();
    expect(screen.getByText(/Google Sheets Live Database Synced & Locked!/i)).toBeInTheDocument();
  });

  it('triggers canvas export when Download Pass button is clicked', () => {
    const drawSpy = vi.spyOn(canvasTicketModule, 'drawPassToCanvas').mockImplementation(() => {});
    const exportSpy = vi.spyOn(canvasTicketModule, 'exportCanvasToPng').mockImplementation(() => {});

    render(
      <DigitalPassCard
        ticketId="CHTR-2026-999"
        formData={sampleFormData}
        currentEvent={sampleCurrentEvent}
        onReset={mockOnReset}
      />
    );

    const downloadBtn = screen.getByRole('button', { name: /Download Pass \(PNG Image\)/i });
    fireEvent.click(downloadBtn);

    expect(drawSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(exportSpy).toHaveBeenCalledWith(expect.any(Object), 'Chaturanga-Pass-CHTR-2026-999.png');
  });

  it('triggers onReset callback when Register Another Player is clicked', () => {
    render(
      <DigitalPassCard
        ticketId="CHTR-2026-999"
        formData={sampleFormData}
        currentEvent={sampleCurrentEvent}
        onReset={mockOnReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Register Another Player/i });
    fireEvent.click(resetBtn);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('triggers window.print when Print / Save PDF is clicked', () => {
    const printMock = vi.fn();
    window.print = printMock;

    render(
      <DigitalPassCard
        ticketId="CHTR-2026-999"
        formData={sampleFormData}
        currentEvent={sampleCurrentEvent}
        onReset={mockOnReset}
      />
    );

    const printBtn = screen.getByRole('button', { name: /Print \/ Save PDF/i });
    fireEvent.click(printBtn);

    expect(printMock).toHaveBeenCalledTimes(1);
  });
});
