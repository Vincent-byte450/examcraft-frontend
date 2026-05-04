import { useState, useEffect, useRef } from 'react';
import { Phone, Lock, Mail, Zap, Globe, Shield, X, ArrowLeft, Eye, EyeOff, ArrowRight, CheckCircle, User } from 'lucide-react';
import { useGlobals } from "./Globals";
import LandingPage from './LandingPage';

/* ─── helpers ────────────────────────────────────────────── */
const GlowOrb = ({ style }) => (
  <div style={{ position:'absolute', borderRadius:'50%', filter:'blur(80px)', pointerEvents:'none', ...style }}/>
);

const useMount = (delay = 0) => {
  const [m, setM] = useState(false);
  useEffect(() => { const t = setTimeout(() => setM(true), delay); return () => clearTimeout(t); }, [delay]);
  return m;
};

/* ─── input field ────────────────────────────────────────── */
const InputField = ({ label, type = 'text', icon: Icon, placeholder, value, onChange, pattern, title }) => {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'#6A6A62', marginBottom:7, fontFamily:"'Space Mono',monospace" }}>{label}</label>
      <div style={{ position:'relative' }}>
        {Icon && (
          <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused ? '#00FF7F' : '#3A3D45', transition:'color .2s', pointerEvents:'none' }}>
            <Icon size={15}/>
          </div>
        )}
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={placeholder} pattern={pattern} title={title} required
          style={{ width:'100%', boxSizing:'border-box', padding:`13px ${isPass ? '44px' : '14px'} 13px ${Icon ? '44px' : '14px'}`, background: focused ? '#0F1410' : '#0D0F16', border:`1px solid ${focused ? '#00FF7F50' : '#1A1D25'}`, borderRadius:11, color:'#E8E8E0', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all .2s', boxShadow: focused ? '0 0 0 3px #00FF7F10' : 'none' }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(p => !p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#3A3D45', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}>
            {show ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── password strength ──────────────────────────────────── */
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    { label:'Min 6 chars', pass: password.length >= 6 },
    { label:'Uppercase',   pass: /[A-Z]/.test(password) },
    { label:'Number',      pass: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#FF4444','#FF9B3B','#00FF7F'];
  return (
    <div style={{ marginTop:-10, marginBottom:16 }}>
      <div style={{ display:'flex', gap:5, marginBottom:7 }}>
        {[0,1,2].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < score ? colors[score-1] : '#1A1D25', transition:'background .3s' }}/>)}
      </div>
      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        {checks.map(c => (
          <div key={c.label} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color: c.pass ? '#00FF7F' : '#4A4D55', fontFamily:'Space Mono', transition:'color .2s' }}>
            <CheckCircle size={9}/> {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── left panel (desktop only) ─────────────────────────── */
const LeftPanel = ({ isLogin }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n+1), 3000); return () => clearInterval(t); }, []);
  const metrics = [
    { label:'Exams Created Today', values:['1,248','1,249','1,251','1,254'], color:'#00FF7F' },
    { label:'Active Educators',    values:['5,032','5,033','5,033','5,035'], color:'#00C8FF' },
    { label:'Questions Generated', values:['84.2k','84.3k','84.4k','84.5k'], color:'#9B6BFF' },
  ];
  return (
    <div style={{ position:'relative', background:'#06080C', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'44px 44px', overflow:'hidden', minHeight:'100%' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1A1D2512 1px,transparent 1px),linear-gradient(90deg,#1A1D2512 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>
      <GlowOrb style={{ width:400, height:400, background:'radial-gradient(circle,#00FF7F18 0%,transparent 70%)', top:'10%', left:'-20%' }}/>
      <GlowOrb style={{ width:300, height:300, background:'radial-gradient(circle,#00C8FF12 0%,transparent 70%)', bottom:'20%', right:'-10%' }}/>

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:52 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#00FF7F,#00C8FF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19 }}>📖</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, letterSpacing:'-0.01em', lineHeight:1 }}>Mtihani Kenya</div>
            <div style={{ fontSize:9, color:'#4A4D55', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Space Mono' }}>Exam Craft</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom:44 }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#00FF7F', marginBottom:14 }}>🇰🇪 Kenya Curriculum Platform</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,2.5vw,38px)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:14 }}>
            {isLogin ? <>Welcome<br/><span style={{ background:'linear-gradient(135deg,#00FF7F,#00C8FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>back.</span></> : <>Join<br/><span style={{ background:'linear-gradient(135deg,#00FF7F,#00C8FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>5,000+ educators.</span></>}
          </h2>
          <p style={{ fontSize:14, color:'#6A6A62', lineHeight:1.7, maxWidth:300 }}>
            {isLogin ? 'Sign in to continue building curriculum-aligned exams in minutes, not hours.' : 'Create professional CBC and 8-4-4 aligned exams with AI. Free to start.'}
          </p>
        </div>

        {/* Live metrics */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:44 }}>
          {metrics.map((m,i) => (
            <div key={m.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:11 }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:m.color, boxShadow:`0 0 8px ${m.color}60`, animation:'pulse 2s ease-in-out infinite', animationDelay:`${i*.4}s` }}/>
                <span style={{ fontSize:12, color:'#6A6A62' }}>{m.label}</span>
              </div>
              <span style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:13, color:m.color, transition:'all .5s' }}>{m.values[tick % m.values.length]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ position:'relative', zIndex:1, padding:'22px', background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:14, borderLeft:'3px solid #00FF7F' }}>
        <div style={{ fontSize:22, color:'#00FF7F', lineHeight:0, marginBottom:10, fontFamily:'Georgia,serif' }}>"</div>
        <p style={{ fontSize:13, color:'#9A9A90', lineHeight:1.75, fontStyle:'italic', marginBottom:14 }}>Creating a full KCSE mock paper used to take me an entire Sunday. Now it takes 8 minutes.</p>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#00FF7F30,#00C8FF30)', border:'1px solid #00FF7F30', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Mono', fontWeight:700, fontSize:11, color:'#00FF7F' }}>EN</div>
          <div>
            <div style={{ fontWeight:600, fontSize:13, color:'#E8E8E0' }}>Eunice Njeri</div>
            <div style={{ fontSize:11, color:'#4A4D55' }}>Head of Mathematics, Nairobi Girls</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── forgot password modal ──────────────────────────────── */
const ForgotModal = ({ onClose, apiRequest }) => {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setStatus('Please enter your email address.'); return; }
    setSending(true);
    try {
      const response = await apiRequest('/api/auth/reset-password', { method:'POST', body:JSON.stringify({ email }) });
      const data = await response.json();
      if (response.ok) { setSuccess(true); }
      else setStatus(data.message || 'Failed to send reset link.');
    } catch { setStatus('Server error. Please try again.'); }
    finally { setSending(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(8,10,15,.88)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:20 }}>
      <div style={{ background:'#0D0F16', border:'1px solid #2A2D35', borderRadius:18, padding:'32px', width:'100%', maxWidth:380, position:'relative', boxShadow:'0 40px 120px #00000080' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'#4A4D55', cursor:'pointer', display:'flex', padding:4 }}><X size={16}/></button>
        {!success ? (
          <>
            <div style={{ width:44, height:44, borderRadius:11, background:'#1A2218', border:'1px solid #00FF7F20', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}><Lock size={18} color="#00FF7F"/></div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:7, letterSpacing:'-0.02em' }}>Reset password</h3>
            <p style={{ fontSize:13, color:'#6A6A62', lineHeight:1.6, marginBottom:24 }}>Enter your email and we'll send a reset link instantly.</p>
            <form onSubmit={handle}>
              <InputField label="Email" type="email" icon={Mail} placeholder="you@school.ac.ke" value={email} onChange={e => setEmail(e.target.value)}/>
              {status && <div style={{ fontSize:12, color:'#FF8888', marginBottom:14, fontFamily:'Space Mono' }}>{status}</div>}
              <button type="submit" disabled={sending} style={{ width:'100%', padding:'12px', background:'#00FF7F', border:'none', borderRadius:11, color:'#080A0F', fontWeight:700, fontSize:14, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? .6 : 1, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
                {sending ? 'Sending…' : <>Send Reset Link <ArrowRight size={13}/></>}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#00FF7F20', border:'1px solid #00FF7F40', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}><CheckCircle size={24} color="#00FF7F"/></div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:7 }}>Check your email</h3>
            <p style={{ fontSize:13, color:'#6A6A62', lineHeight:1.6, marginBottom:22 }}>A reset link was sent to <strong style={{ color:'#E8E8E0' }}>{email}</strong></p>
            <button onClick={onClose} style={{ padding:'10px 26px', background:'none', border:'1px solid #2A2D35', borderRadius:100, color:'#E8E8E0', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Back to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── main Auth ──────────────────────────────────────────── */
const Auth = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'Teacher' });
  const [transitioning, setTransitioning] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const { setCurrentView, isLoading, error:globalError, login, register, isAuthenticated, user, apiRequest } = useGlobals();
  const mounted = useMount(50);

  useEffect(() => {
    if (isAuthenticated && user) setCurrentView('dashboard');
  }, [isAuthenticated, user, setCurrentView]);

  const handleGetStarted = () => { setShowAuthForm(true); setIsLogin(false); };
  const handleSignIn     = () => { setShowAuthForm(true); setIsLogin(true); };

  const handleToggle = () => {
    setTransitioning(true); setLocalError('');
    setTimeout(() => {
      setIsLogin(p => !p);
      setFormData({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'Teacher' });
      setTransitioning(false);
    }, 220);
  };

  const set = k => e => setFormData(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    setLocalError('');
    if (!formData.email.trim())    return setLocalError('Email is required')    || false;
    if (!formData.password.trim()) return setLocalError('Password is required') || false;
    if (!isLogin) {
      if (!formData.name.trim())  return setLocalError('Full name is required') || false;
      if (!formData.phone.trim()) return setLocalError('Phone number is required') || false;
      if (formData.password !== formData.confirmPassword) return setLocalError('Passwords do not match') || false;
      if (formData.password.length < 6) return setLocalError('Password must be at least 6 characters') || false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role });
      if (!result.success) setLocalError(result.error || 'Authentication failed');
    } catch (err) { setLocalError(err.message || 'An error occurred. Please try again.'); }
  };

  const displayError = localError || globalError;

  if (!showAuthForm) return <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn}/>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #3A3D45; }
        input:-webkit-autofill, input:-webkit-autofill:focus { -webkit-text-fill-color:#E8E8E0!important; -webkit-box-shadow:0 0 0 1000px #0D0F16 inset!important; }
        select option { background:#0D0F16; color:#E8E8E0; }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .auth-enter { animation: slideUp .45s ease forwards; }

        /* Auth layout */
        .auth-shell  { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        .auth-left   { display:flex; flex-direction:column; }
        .auth-right  { position:relative; display:flex; flex-direction:column; justify-content:center; padding:44px 56px; background:#080A0F; overflow:hidden; }
        .auth-form-inner { max-width:400px; width:100%; position:relative; zIndex:1; }

        /* Mobile: single column */
        @media (max-width: 768px) {
          .auth-shell  { grid-template-columns:1fr; }
          .auth-left   { display:none; }
          .auth-right  { padding:32px 24px; justify-content:flex-start; padding-top:80px; min-height:100vh; }
          .auth-form-inner { max-width:100%; }
        }

        /* Small mobile */
        @media (max-width: 400px) {
          .auth-right { padding:28px 18px; padding-top:72px; }
        }
      `}</style>

      <div className="auth-shell" style={{ background:'#080A0F', color:'#E8E8E0', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", opacity: mounted ? 1 : 0, transition:'opacity .5s ease' }}>

        {/* Left panel — hidden on mobile via CSS */}
        <div className="auth-left"><LeftPanel isLogin={isLogin}/></div>

        {/* Right — form */}
        <div className="auth-right">
          <GlowOrb style={{ width:400, height:400, background:'radial-gradient(circle,#00FF7F08 0%,transparent 70%)', top:'20%', right:'-20%' }}/>

          {/* Back button */}
          <button onClick={() => setShowAuthForm(false)} style={{ position:'absolute', top:22, left:22, display:'flex', alignItems:'center', gap:7, background:'none', border:'1px solid #1A1D25', borderRadius:100, padding:'7px 14px', color:'#6A6A62', fontSize:12, cursor:'pointer', transition:'all .2s', fontFamily:"'DM Sans',sans-serif", zIndex:2 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#2A2D35'; e.currentTarget.style.color='#E8E8E0'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#1A1D25'; e.currentTarget.style.color='#6A6A62'; }}>
            <ArrowLeft size={12}/> Back
          </button>

          {/* Mobile logo (only visible when left panel is hidden) */}
          <div style={{ display:'none' }} className="mobile-logo">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#00FF7F,#00C8FF)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:17 }}>📖</span></div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, lineHeight:1 }}>Mtihani Kenya</div>
                <div style={{ fontSize:9, color:'#4A4D55', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Space Mono' }}>Exam Craft</div>
              </div>
            </div>
          </div>

          <div className="auth-form-inner">
            {/* Header */}
            <div key={isLogin ? 'lh' : 'rh'} style={{ marginBottom:32, opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(8px)' : 'translateY(0)', transition:'all .22s ease' }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'#00FF7F', marginBottom:10 }}>
                {isLogin ? 'Log In' : 'Create Account'}
              </div>
              {/* <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(24px,3vw,36px)', letterSpacing:'-0.03em', lineHeight:1.06, marginBottom:8 }}>
                {isLogin ? 'Sign in to your account.' : 'Create your free account.'}
              </h1> */}
              <p style={{ fontSize:14, color:'#6A6A62', lineHeight:1.6 }}>
                {isLogin ? 'Enter your credentials to continue.' : 'Join thousands of Kenyan educators saving hours every week.'}
              </p>
            </div>

            {/* Error */}
            {displayError && (
              <div style={{ marginBottom:20, padding:'12px 16px', background:'#FF444420', border:'1px solid #FF444440', borderRadius:11, fontSize:13, color:'#FF8888', display:'flex', alignItems:'center', gap:8 }}>
                <X size={13} color="#FF6666"/> {displayError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} key={isLogin ? 'lf' : 'rf'} className="auth-enter">
              {!isLogin && <InputField label="Full Name"       icon={User}  placeholder="e.g. Amina Oduya"         value={formData.name}            onChange={set('name')}/>}
              <InputField label="Email Address"               icon={Mail}  type="email" placeholder="you@school.ac.ke" value={formData.email}           onChange={set('email')}/>
              {!isLogin && <InputField label="Phone Number"   icon={Phone} type="tel"   placeholder="+254 712 345 678" value={formData.phone}           onChange={set('phone')} pattern="^(\+254|0)?7\d{8}$" title="Valid Kenyan number"/>}
              <InputField label="Password"                    icon={Lock}  type="password" placeholder={isLogin ? 'Your password' : 'Create a password'} value={formData.password} onChange={set('password')}/>
              {!isLogin && <PasswordStrength password={formData.password}/>}
              {!isLogin && <InputField label="Confirm Password" icon={Lock} type="password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={set('confirmPassword')}/>}

              {!isLogin && (
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'#6A6A62', marginBottom:7, fontFamily:"'Space Mono',monospace" }}>Role</label>
                  <select value={formData.role} onChange={set('role')} style={{ width:'100%', padding:'13px 14px', background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:11, color:'#E8E8E0', fontSize:14, outline:'none', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>
              )}

              {isLogin && (
                <div style={{ textAlign:'right', marginBottom:20, marginTop:-6 }}>
                  <button type="button" onClick={() => setShowForgot(true)} style={{ background:'none', border:'none', fontSize:13, color:'#00FF7F', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>Forgot password?</button>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                style={{ width:'100%', padding:'14px', background: isLoading ? '#1A1D25' : '#00FF7F', border:'none', borderRadius:11, color: isLoading ? '#4A4D55' : '#080A0F', fontWeight:700, fontSize:15, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:9, transition:'all .2s', boxShadow: isLoading ? 'none' : '0 8px 32px #00FF7F20', marginBottom:18 }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background='#33FF99'; e.currentTarget.style.transform='translateY(-1px)'; }}}
                onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.background='#00FF7F'; e.currentTarget.style.transform='translateY(0)'; }}}>
                {isLoading ? (
                  <><div style={{ width:17, height:17, border:'2px solid #4A4D55', borderTopColor:'#E8E8E0', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>{isLogin ? 'Signing in…' : 'Creating account…'}</>
                ) : (
                  <><Zap size={15}/>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight size={14}/></>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div style={{ textAlign:'center', borderTop:'1px solid #1A1D25', paddingTop:20 }}>
              <span style={{ fontSize:13, color:'#4A4D55' }}>{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
              <button onClick={handleToggle} disabled={isLoading} style={{ background:'none', border:'none', fontSize:13, color:'#00FF7F', cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif", textDecoration:'underline', textUnderlineOffset:3 }}>
                {isLogin ? 'Sign up free' : 'Sign in'}
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:24, flexWrap:'wrap' }}>
              {[{icon:Shield,text:'Secure & Encrypted'},{icon:Globe,text:'Kenya Curriculum'}].map(({icon:Icon,text}) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#3A3D45' }}><Icon size={11} color="#3A3D45"/> {text}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && <ForgotModal onClose={() => setShowForgot(false)} apiRequest={apiRequest}/>}

      {/* Mobile logo injection */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-logo { display:flex !important; flex-direction:column; }
        }
      `}</style>
    </>
  );
};

export default Auth;