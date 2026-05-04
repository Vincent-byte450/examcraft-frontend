import { useEffect } from "react";

const AdBanner = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div style={{
      width: '100%',
      /* thin top/bottom breathing room — not the chunky my-4 */
      margin: '8px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
    }}>
      {/* disclosure label — tiny, legal requirement, barely there */}
      <div style={{
        width: '100%',
        textAlign: 'right',
        fontSize: 9,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#3A3D45',
        fontFamily: "'Space Mono',monospace",
        lineHeight: 1,
        marginBottom: 2,
        paddingRight: 2,
      }}>
        Ad
      </div>

      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          /* leaderboard / banner height — short and horizontal */
          height: '60px',
          overflow: 'hidden',
        }}
        data-ad-client="ca-pub-5613714969692551"
        data-ad-slot="5615415060"
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />

      {/* 1px separator so it reads as a contained unit, not floating content */}
      <div style={{ width: '100%', height: 1, background: '#1A1D25', marginTop: 4 }}/>
    </div>
  );
};

export default AdBanner;