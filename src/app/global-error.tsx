'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0B0F14', color: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#D4AF7C', marginBottom: '1rem' }}>Something went wrong!</h2>
          <p style={{ color: '#A0A6B0', fontSize: '0.875rem', marginBottom: '1.5rem' }}>An error occurred in the application layout.</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D4AF7C', color: '#0B0F14', border: 'none', borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
