import { ImageResponse } from 'next/og';

export const alt = 'CHATURANGA • JGEC Premier Collegiate Chess Club';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0B0F14',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(212, 175, 124, 0.22) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(212, 175, 124, 0.08) 0%, transparent 50%)',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle chess grid border frame */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(212, 175, 124, 0.3)',
            borderRadius: '24px',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header / Institution Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '8px 20px',
              backgroundColor: 'rgba(212, 175, 124, 0.12)',
              border: '1px solid rgba(212, 175, 124, 0.35)',
              borderRadius: '999px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#34D399',
              }}
            />
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#D4AF7C',
                textTransform: 'uppercase',
              }}
            >
              Jalpaiguri Government Engineering College
            </span>
          </div>

          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: '#A0A6B0',
              textTransform: 'uppercase',
            }}
          >
            Est. 2012 • FIDE Standard
          </span>
        </div>

        {/* Center Hero Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            maxWidth: '920px',
          }}
        >
          {/* Emblem */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #1C222C 0%, #12161D 100%)',
              border: '2px solid rgba(212, 175, 124, 0.5)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 124, 0.25)',
            }}
          >
            <svg
              width="46"
              height="46"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4AF7C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#F5F5F5',
              margin: '0',
              lineHeight: 1.05,
              textTransform: 'uppercase',
            }}
          >
            CHATURANGA
          </h1>

          <p
            style={{
              fontSize: '24px',
              fontWeight: 500,
              color: '#D4AF7C',
              letterSpacing: '0.08em',
              margin: '0',
            }}
          >
            The Bastion of Mind Sports in North Bengal
          </p>

          <p
            style={{
              fontSize: '18px',
              color: '#A0A6B0',
              margin: '0',
              maxWidth: '750px',
              lineHeight: 1.4,
            }}
          >
            Official collegiate Swiss tournaments, live Elo rating leaderboards, certified digital arbiter passes, and collegiate grandmaster community.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 22px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: '#F5F5F5',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#D4AF7C', fontWeight: 700 }}>•</span>
            <span>Collegiate Swiss Rapid</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 22px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: '#F5F5F5',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#D4AF7C', fontWeight: 700 }}>•</span>
            <span>Live Elo Leaderboards</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 22px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: '#F5F5F5',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <span style={{ color: '#D4AF7C', fontWeight: 700 }}>•</span>
            <span>Instant Tournament Passes</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
