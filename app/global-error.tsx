'use client';

// Global error component - must not use any context hooks (no next-intl, no auth, etc.)
// because it renders outside of the providers in the layout
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    fontFamily: 'sans-serif',
                    textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#111827' }}>
                        오류가 발생했습니다
                    </h2>
                    <p style={{ color: '#6B7280', marginBottom: '24px' }}>
                        Something went wrong. Please try again.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        다시 시도 / Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
