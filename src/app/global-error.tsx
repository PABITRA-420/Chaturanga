'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: 'var(--bg, #FAFAFA)',
          color: 'var(--fg, #09090B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '400px',
            border: '1px solid var(--border, #E4E4E7)',
            backgroundColor: 'var(--surface, #FFFFFF)',
            borderRadius: '4px',
          }}
        >
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent, #8F6415)', marginBottom: '0.5rem', fontWeight: 700 }}>
            System Fault
          </p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--fg-muted, #52525B)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            An error occurred in the application layout.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: 'var(--primary, #18181B)',
              color: 'var(--on-primary, #FAFAFA)',
              border: 'none',
              borderRadius: '2px',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
