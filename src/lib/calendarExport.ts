/**
 * Calendar Integration Engine (RFC 5545 iCalendar & Google Calendar URI Generator)
 * Formats tournament dates and metadata for 1-click calendar addition.
 */

export interface CalendarEventData {
  id: string;
  title: string;
  description: string;
  venue: string;
  targetDate: string; // ISO string e.g. "2026-11-07T09:30:00"
  durationHours?: number; // Defaults to 8.5 hours (full-day tournament)
}

/**
 * Format Date into YYYYMMDDTHHmmssZ format for calendar URLs and iCal files
 */
function formatUtcTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '');
}

/**
 * Generate Google Calendar 1-Click Event Link
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const startDate = new Date(event.targetDate);
  const durationHours = event.durationHours ?? 8.5;
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const startUtc = formatUtcTimestamp(startDate);
  const endUtc = formatUtcTimestamp(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `CHATURANGA: ${event.title}`,
    dates: `${startUtc}/${endUtc}`,
    details: `${event.description}\n\nOrganized by CHATURANGA • JGEC Chess Club\nOfficial Website: https://chaturangajgec.netlify.app`,
    location: event.venue || 'Jalpaiguri Government Engineering College, West Bengal',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate standard RFC 5545 iCalendar (.ics) string for Apple Calendar, Outlook, and mobile devices
 */
export function generateIcsContent(event: CalendarEventData): string {
  const startDate = new Date(event.targetDate);
  const durationHours = event.durationHours ?? 8.5;
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  const nowUtc = formatUtcTimestamp(new Date());

  const startUtc = formatUtcTimestamp(startDate);
  const endUtc = formatUtcTimestamp(endDate);
  const cleanTitle = event.title.replace(/[\r\n]+/g, ' ');
  const cleanVenue = event.venue.replace(/[\r\n]+/g, ' ');
  const cleanDescription = (event.description || '').replace(/[\r\n]+/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chaturanga JGEC//Chess Club Arena//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:tournament-${event.id}@chaturangajgec.netlify.app`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:CHATURANGA: ${cleanTitle}`,
    `DESCRIPTION:${cleanDescription}\\n\\nOrganized by CHATURANGA • JGEC Chess Club\\nWebsite: https://chaturangajgec.netlify.app`,
    `LOCATION:${cleanVenue}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Trigger immediate browser download of the .ics file
 */
export function downloadIcsFile(event: CalendarEventData): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFilename = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  link.download = `chaturanga-${safeFilename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

