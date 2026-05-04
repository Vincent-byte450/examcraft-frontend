import { useState } from "react";
import { API_BASE_URL } from '../config/env';
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Zap, Shield, Globe, Eye, EyeOff, Check } from "lucide-react";

/* ─── password strength ──────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#FF4444' };
  if (score <= 2) return { score, label: 'Fair',   color: '#FF9B3B' };
  if (score <= 3) return { score, label: 'Good',   color: '#00C8FF' };
  return              { score, label: 'Strong', color: '#00FF7F' };
};

/* ─── password input ─────────────────────────────────────── */
const PwInput = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:'block', fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:8 }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <Lock size={14} color="#3A3D45" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:'100%', padding:'12px 44px 12px 40px',
            background: focused ? '#0F1410' : '#080A0F',
            border: `1px solid ${focused ? '#00FF7F50' : '#1A1D25'}`,
            borderRadius: 10, color:'#E8E8E0', fontSize:13,
            fontFamily:"'DM Sans',sans-serif", outline:'none',
            transition:'all .2s', boxSizing:'border-box',
            boxShadow: focused ? '0 0 0 3px #00FF7F0D' : 'none',
          }}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#3A3D45', cursor:'pointer', display:'flex', alignItems:'center', transition:'color .2s', padding:0 }}
          onMouseEnter={e => e.currentTarget.style.color='#9A9A90'}
          onMouseLeave={e => e.currentTarget.style.color='#3A3D45'}>
          {show ? <EyeOff size={14}/> : <Eye size={14}/>}
        </button>
      </div>
    </div>
  );
};

/* ─── MAIN ───────────────────────────────────────────────── */
const ResetPassword = () => {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]                 = useState('');
  const [isSuccess, setIsSuccess]             = useState(false);
  const [isLoading, setIsLoading]             = useState(false);

  const strength = getStrength(password);
  const matches  = confirmPassword && password === confirmPassword;
  const mismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setMessage('Passwords do not match.'); return; }

    setIsLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setMessage('Password reset successful. Redirecting…');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage(data.message || 'Reset failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes rpPin  { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes rpSpin { to { transform: rotate(360deg); } }
        @keyframes rpIn   { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: #3A3D45; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#080A0F', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* ambient glows */}
        <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:700, height:320, borderRadius:'50%', background:'radial-gradient(ellipse,#00FF7F05 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-15%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,#9B6BFF05 0%,transparent 70%)', pointerEvents:'none' }}/>
        {/* dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,#1A1D25 1px,transparent 1px)', backgroundSize:'32px 32px', opacity:.6, pointerEvents:'none' }}/>

        {/* card */}
        <div style={{ position:'relative', width:'100%', maxWidth:440, background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:20, padding:'44px 40px', boxShadow:'0 40px 120px rgba(0,0,0,.6)', animation:'rpPin .45s cubic-bezier(.16,1,.3,1) forwards' }}>

          {/* top accent strip */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#00FF7F,transparent)', borderRadius:'20px 20px 0 0' }}/>

          {/* logo mark */}
          <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.14em', color:'#3A3D45', marginBottom:32, textAlign:'center' }}>
            Mtihani Kenya
          </div>

          {/* icon */}
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#00FF7F10', border:'1px solid #00FF7F25', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>
            <Lock size={26} color="#00FF7F"/>
          </div>

          {/* heading */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, letterSpacing:'-0.02em', color:'#E8E8E0', marginBottom:8 }}>
              Reset your password
            </h1>
            <p style={{ fontSize:13, color:'#5A5D65', lineHeight:1.7 }}>
              Enter and confirm your new password below.
            </p>
          </div>

          {/* message banner */}
          {message && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'12px 14px', background: isSuccess?'#00FF7F0A':'#FF44440A', border:`1px solid ${isSuccess?'#00FF7F30':'#FF444430'}`, borderRadius:10, marginBottom:20, animation:'rpIn .25s ease forwards' }}>
              <span style={{ fontSize:13, color: isSuccess?'#00FF7F':'#FF6666', lineHeight:1.6 }}>{message}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

            <PwInput label="New Password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter new password"/>

            {/* strength meter */}
            {password.length > 0 && (
              <div style={{ marginTop:-10, animation:'rpIn .2s ease forwards' }}>
                <div style={{ display:'flex', gap:4, marginBottom:5 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background: strength.score >= i ? strength.color : '#1A1D25', transition:'background .3s' }}/>
                  ))}
                </div>
                <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color: strength.color, textTransform:'uppercase', letterSpacing:'0.07em' }}>
                  {strength.label}
                </div>
              </div>
            )}

            <div>
              <PwInput label="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm new password"/>
              {/* match indicator */}
              {confirmPassword.length > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:7, animation:'rpIn .2s ease forwards' }}>
                  <div style={{ width:14, height:14, borderRadius:'50%', background: matches?'#00FF7F15':'#FF444415', border:`1px solid ${matches?'#00FF7F40':'#FF444440'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {matches && <Check size={8} color="#00FF7F" strokeWidth={3}/>}
                  </div>
                  <span style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color: matches?'#00FF7F':'#FF6666', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    {matches ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* submit */}
            <button type="submit" disabled={isLoading || (confirmPassword.length > 0 && mismatch)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                padding:'13px 0', width:'100%', marginTop:4,
                background: (isLoading || mismatch) ? '#1A1D25' : '#00FF7F',
                border:'none', borderRadius:100,
                color: (isLoading || mismatch) ? '#3A3D45' : '#080A0F',
                fontSize:14, fontWeight:700, cursor: (isLoading || mismatch) ? 'not-allowed' : 'pointer',
                fontFamily:"'DM Sans',sans-serif",
                boxShadow: (!isLoading && !mismatch) ? '0 6px 24px #00FF7F25' : 'none',
                transition:'all .2s',
              }}
              onMouseEnter={e => { if (!isLoading && !mismatch) { e.currentTarget.style.background='#33FF99'; e.currentTarget.style.transform='translateY(-1px)'; }}}
              onMouseLeave={e => { if (!isLoading && !mismatch) { e.currentTarget.style.background='#00FF7F'; e.currentTarget.style.transform='translateY(0)'; }}}>
              {isLoading ? (
                <><div style={{ width:14, height:14, border:'2px solid #3A3D45', borderTopColor:'#9A9A90', borderRadius:'50%', animation:'rpSpin .8s linear infinite' }}/> Resetting…</>
              ) : (
                <><Zap size={14}/> Reset Password</>
              )}
            </button>
          </form>

          {/* footer */}
          <div style={{ marginTop:28, paddingTop:20, borderTop:'1px solid #1A1D25', display:'flex', alignItems:'center', justifyContent:'center', gap:20 }}>
            {[{ icon:Shield, label:'Secure' },{ icon:Globe, label:'Kenya Curriculum' }].map(({ icon:Icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontFamily:"'Space Mono',monospace", color:'#3A3D45' }}>
                <Icon size={11}/> {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;