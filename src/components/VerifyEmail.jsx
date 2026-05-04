import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from '../config/env';
import { useParams, useNavigate } from "react-router-dom";

/* ─── shared full-screen shell ───────────────────────────── */
const Shell = ({ children }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      @keyframes vsPin  { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes vsSpin { to { transform: rotate(360deg); } }
      @keyframes vsPulse{ 0%,100%{opacity:1} 50%{opacity:.4} }
      @keyframes vsDot  { 0%,80%,100%{transform:scale(0);opacity:0} 40%{transform:scale(1);opacity:1} }
    `}</style>
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#080A0F', fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient glows */}
      <div style={{ position:'absolute', top:'-15%', left:'50%', transform:'translateX(-50%)', width:600, height:300, borderRadius:'50%', background:'radial-gradient(ellipse,#00FF7F06 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(ellipse,#9B6BFF06 0%,transparent 70%)', pointerEvents:'none' }}/>
      {/* dot grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,#1A1D25 1px,transparent 1px)', backgroundSize:'32px 32px', opacity:.6, pointerEvents:'none' }}/>

      {/* card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480,
        background: '#0D0F16', border: '1px solid #1A1D25',
        borderRadius: 20, padding: '48px 44px',
        boxShadow: '0 40px 120px rgba(0,0,0,.6)',
        animation: 'vsPin .45s cubic-bezier(.16,1,.3,1) forwards',
        textAlign: 'center',
      }}>
        {/* logo mark */}
        <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.14em', color:'#3A3D45', marginBottom:32 }}>
          Mtihani Kenya
        </div>
        {children}
      </div>
    </div>
  </>
);

/* ─── icon circle ────────────────────────────────────────── */
const IconCircle = ({ color, bg, border, children, pulse }) => (
  <div style={{
    width: 72, height: 72, borderRadius: '50%',
    background: bg, border: `1px solid ${border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px',
    animation: pulse ? 'vsPulse 2s ease infinite' : 'none',
  }}>
    <span style={{ fontSize: 32 }}>{children}</span>
  </div>
);

/* ─── CTA button ─────────────────────────────────────────── */
const CTABtn = ({ href, label, accent = '#00FF7F' }) => (
  <a href={href}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '13px 36px', background: accent, borderRadius: 100,
      color: '#080A0F', fontSize: 14, fontWeight: 700,
      fontFamily: "'DM Sans',sans-serif", textDecoration: 'none',
      boxShadow: `0 6px 24px ${accent}30`, transition: 'all .2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 10px 32px ${accent}40`; }}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 6px 24px ${accent}30`; }}>
    {label}
  </a>
);

/* ─── loading dots ───────────────────────────────────────── */
const LoadingDots = () => (
  <div style={{ display:'flex', gap:6, justifyContent:'center', margin:'20px 0' }}>
    {[0,1,2].map(i => (
      <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#00FF7F', animation:`vsDot 1.2s ease ${i*0.2}s infinite` }}/>
    ))}
  </div>
);

/* ─── progress bar ───────────────────────────────────────── */
const ProgressBar = ({ accent = '#00FF7F' }) => (
  <div style={{ width:'100%', height:2, background:'#1A1D25', borderRadius:2, overflow:'hidden', margin:'24px 0 0' }}>
    <div style={{ height:'100%', background:`linear-gradient(90deg,${accent},${accent}80)`, borderRadius:2, animation:'vsProgress 2s ease forwards' }}/>
    <style>{`@keyframes vsProgress{from{width:0}to{width:100%}}`}</style>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   VerifyEmail — verifying state
═══════════════════════════════════════════════════════════ */
export const VerifyEmail = () => {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [status, setStatus] = useState("verifying");
  const hasRun     = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/auth/verify-email/${token}`,
          { method: "GET" }
        );
        if (res.ok) {
          setStatus("success");
          setTimeout(() => navigate("/verify-email-success"), 2000);
        } else {
          setStatus("error");
          setTimeout(() => navigate("/verify-email-failed"), 2000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setTimeout(() => navigate("/verify-email-failed"), 2000);
      }
    };

    if (token && !hasRun.current) {
      hasRun.current = true;
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <Shell>
      <IconCircle bg="#00FF7F10" border="#00FF7F25" pulse>🔍</IconCircle>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, letterSpacing:'-0.02em', color:'#E8E8E0', marginBottom:12 }}>
        Verifying your email…
      </div>
      <p style={{ fontSize:14, color:'#5A5D65', lineHeight:1.7, maxWidth:320, margin:'0 auto' }}>
        Please wait while we confirm your Mtihani Kenya account.
      </p>
      <LoadingDots/>
      <ProgressBar accent="#00FF7F"/>
    </Shell>
  );
};

/* ═══════════════════════════════════════════════════════════
   VerifyEmailSuccess
═══════════════════════════════════════════════════════════ */
export const VerifyEmailSuccess = () => (
  <Shell>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#00FF7F,transparent)', borderRadius:'20px 20px 0 0' }}/>
    <IconCircle bg="#00FF7F15" border="#00FF7F30">✅</IconCircle>
    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:'-0.02em', color:'#E8E8E0', marginBottom:12 }}>
      Email verified!
    </div>
    <p style={{ fontSize:14, color:'#5A5D65', lineHeight:1.75, maxWidth:320, margin:'0 auto 32px' }}>
      Your account has been successfully verified. You can now sign in to Mtihani Kenya.
    </p>
    <CTABtn href="/" label="Go to Login" accent="#00FF7F"/>
    <div style={{ marginTop:24, fontSize:12, fontFamily:"'Space Mono',monospace", color:'#3A3D45' }}>
      Account confirmed · Mtihani Kenya
    </div>
  </Shell>
);

/* ═══════════════════════════════════════════════════════════
   VerifyEmailFailed
═══════════════════════════════════════════════════════════ */
export const VerifyEmailFailed = () => (
  <Shell>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#FF4444,transparent)', borderRadius:'20px 20px 0 0' }}/>
    <IconCircle bg="#FF444415" border="#FF444430">❌</IconCircle>
    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:'-0.02em', color:'#E8E8E0', marginBottom:12 }}>
      Verification failed
    </div>
    <p style={{ fontSize:14, color:'#5A5D65', lineHeight:1.75, maxWidth:320, margin:'0 auto 12px' }}>
      This link is invalid or has expired.
    </p>
    <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 16px', background:'#FF44440A', border:'1px solid #FF444425', borderRadius:100, fontSize:12, fontFamily:"'Space Mono',monospace", color:'#FF6666', marginBottom:32 }}>
      Request a new link from your account settings
    </div>
    <CTABtn href="/" label="Back to Login" accent="#FF4444"/>
  </Shell>
);

/* ═══════════════════════════════════════════════════════════
   RegistrationStatus — check inbox
═══════════════════════════════════════════════════════════ */
export const RegistrationStatus = () => (
  <Shell>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#00C8FF,transparent)', borderRadius:'20px 20px 0 0' }}/>
    <IconCircle bg="#00C8FF15" border="#00C8FF30">📧</IconCircle>
    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:'-0.02em', color:'#E8E8E0', marginBottom:12 }}>
      Check your inbox
    </div>
    <p style={{ fontSize:14, color:'#5A5D65', lineHeight:1.75, maxWidth:320, margin:'0 auto 12px' }}>
      We sent a verification link to your email address. Click it to activate your Mtihani Kenya account.
    </p>
    <div style={{ display:'flex', flexDirection:'column', gap:8, padding:'16px 18px', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:12, marginBottom:32, textAlign:'left' }}>
      {["Check your spam or junk folder","Link expires after 24 hours","Request a new link if needed"].map((tip, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#00C8FF', flexShrink:0 }}/>
          <span style={{ fontSize:12, color:'#6A6A62' }}>{tip}</span>
        </div>
      ))}
    </div>
    <CTABtn href="/" label="Back to Login" accent="#00C8FF"/>
  </Shell>
);