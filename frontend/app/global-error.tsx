'use client';

/**
 * Last-resort boundary for errors thrown in the root layout itself. It has to
 * render its own <html>/<body>, and cannot rely on app styles loading, so the
 * styling here is deliberately inline and theme-neutral.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#070708',
          color: '#fafafa',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ color: '#a4a4ae', fontSize: 14, margin: '0 0 24px' }}>
            The application failed to load. Please reload the page.
          </p>
          {error.digest && (
            <p style={{ color: '#74747e', fontSize: 12, margin: '0 0 24px' }}>Reference: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{
              cursor: 'pointer',
              border: 0,
              borderRadius: 999,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              background: '#7c3aed',
              color: '#fff',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
