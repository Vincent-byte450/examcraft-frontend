import { useState, useEffect, useRef } from 'react';
import { Brain, Tags, FileText, Database, PieChart, Download, Rocket, PlayCircle, Menu, X, CheckCircle, ArrowRight, ChevronDown, Zap, Shield, Clock } from 'lucide-react';
import { useGlobals } from "./Globals";

const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  );
};

const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = Math.ceil(target / (1800 / 16));
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setCount(target); clearInterval(t); } else setCount(n);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const GlowOrb = ({ style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...style }} />
);

const FEATURES = [
  { icon: Brain,    title: 'AI-Powered Generation',   desc: 'Advanced AI tailored to CBC and 8-4-4 curriculum. Generates unique, relevant questions every time.', tag: 'Core' },
  { icon: Tags,     title: 'Topic Selection',          desc: 'Choose specific topics from Kenya curriculum. Assign custom marks to each for perfect coverage.', tag: 'Smart' },
  { icon: FileText, title: 'Professional Cover Pages', desc: 'School branding, instructions, marks tables. Every exam looks like it was designed by a professional.', tag: 'Polish' },
  { icon: Database, title: 'Question Bank',            desc: 'Thousands of curriculum-aligned questions. Multi-subject, multi-difficulty, always growing.', tag: 'Library' },
  { icon: PieChart, title: 'Mark Analysis',            desc: 'Visual mark distribution across topics. Ensure balanced, fair exams every time.', tag: 'Analytics' },
  { icon: Download, title: 'Multiple Export Options',  desc: 'PDF, Word, or share directly. One click to a finished, print-ready exam.', tag: 'Export' },
];

const STEPS = [
  { n: '01', title: 'Configure',     desc: 'Set title, subject, duration, and curriculum type — CBC or 8-4-4.' },
  { n: '02', title: 'Select Topics', desc: 'Pick curriculum-aligned topics and assign marks to each.' },
  { n: '03', title: 'Generate',      desc: 'AI crafts your questions or you select from the question bank.' },
  { n: '04', title: 'Export',        desc: 'Download a polished exam with a professional cover page.' },
];

const TESTIMONIALS = [
  { text: "Cut my exam prep time by 70%. The CBC-aligned questions are relevant, well-structured, and actually match what we teach.", author: "Dr. James Omondi", role: "Mathematics Teacher, Nairobi", initials: "JO" },
  { text: "Topic selection and mark distribution are game-changers. Perfectly balanced exams in minutes, not hours.", author: "Sarah Wanjiru", role: "Science Teacher, Mombasa", initials: "SW" },
  { text: "The cover pages make our exams look incredibly polished. Parents and the school board are impressed every term.", author: "Michael Kamau", role: "School Principal, Kisumu", initials: "MK" },
];

const PLANS = [
  { name: 'Free',         price: '0',     features: ['5 exams / month', 'Basic question bank', 'PDF export', 'Email support'], highlighted: false, cta: 'Start Free' },
  { name: 'Professional', price: '1,999', features: ['Unlimited exams', 'Full question bank', 'All export formats', 'Priority support', 'Custom branding', 'Analytics'], highlighted: true, cta: 'Get Started' },
  { name: 'Institution',  price: '9,999', features: ['Everything in Pro', 'Multi-user accounts', 'API access', 'Dedicated support', 'Custom integrations', 'Training sessions'], highlighted: false, cta: 'Contact Sales' },
];

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { API_BASE } = useGlobals();
  const [publicStats, setPublicStats] = useState({ examsCreated: 999, educators: 99, satisfaction: 98 });

  // useEffect(() => {
  //   fetch(`${API_BASE}/api/exams/public/stats`)
  //     .then(r => r.json())
  //     .then(d => { if (d.success) setPublicStats(d.stats); })
  //     .catch(() => {});
  // }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const [showDbAlert, setShowDbAlert] = useState(true);

  return (
    <div style={{ background: '#080A0F', color: '#E8E8E0', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      {/* {showDbAlert && (
        <div style={{
          background: '#2A0D0D',
          borderBottom: '1px solid #FF4D4F40',
          color: '#FFDADA',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '13px',
          position: 'relative',
          zIndex: 999
        }}>
          ⚠️ We experienced a database disruption and have migrated from MongoDB to PostgreSQL. 
          Please create a new account to continue using the platform. 
          Your previous data will be restored once the original database is back online.
          
          <button
            onClick={() => setShowDbAlert(false)}
            style={{
              marginLeft: 16,
              background: 'none',
              border: '1px solid #FF4D4F60',
              color: '#FFDADA',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )} */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #00FF7F40; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080A0F; }
        ::-webkit-scrollbar-thumb { background: #00FF7F50; border-radius: 4px; }

        .btn-primary { background:#00FF7F; color:#080A0F; border:none; padding:12px 26px; border-radius:100px; font-weight:600; font-size:14px; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:8px; letter-spacing:.01em; font-family:inherit; white-space:nowrap; }
        .btn-primary:hover { background:#33FF99; transform:translateY(-1px); box-shadow:0 8px 32px #00FF7F30; }
        .btn-ghost { background:transparent; color:#E8E8E0; border:1px solid #2A2D35; padding:12px 26px; border-radius:100px; font-weight:500; font-size:14px; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:8px; font-family:inherit; white-space:nowrap; }
        .btn-ghost:hover { border-color:#4A4D55; background:#1A1D25; }
        .nav-link { color:#9A9A90; font-size:14px; font-weight:500; cursor:pointer; border:none; background:none; transition:color .2s; letter-spacing:.02em; font-family:inherit; }
        .nav-link:hover { color:#E8E8E0; }
        .section-eyebrow { font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:#00FF7F; margin-bottom:16px; display:block; }
        .gradient-text { background:linear-gradient(135deg,#00FF7F 0%,#00C8FF 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .tag { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:4px 12px; border-radius:100px; font-family:'Space Mono',monospace; }

        .feature-card { border:1px solid #1A1D25; border-radius:16px; padding:26px; background:#0D0F16; transition:all .35s; cursor:pointer; height:100%; }
        .feature-card:hover { border-color:#00FF7F30; background:#0D1410; transform:translateY(-4px); box-shadow:0 0 40px #00FF7F10; }
        .plan-card { border-radius:20px; padding:30px; transition:transform .3s; }
        .plan-card:hover { transform:translateY(-5px); }
        .testimonial-card { border:1px solid #1A1D25; border-radius:16px; padding:26px; background:#0D0F16; transition:all .3s; }
        .testimonial-card:hover { border-color:#2A2D35; }

        .ticker-wrap { overflow:hidden; border-top:1px solid #1A1D25; border-bottom:1px solid #1A1D25; padding:12px 0; }
        .ticker-inner { display:flex; width:max-content; animation:ticker 28s linear infinite; }
        .ticker-item { white-space:nowrap; font-family:'Space Mono',monospace; font-size:11px; color:#3A3D45; letter-spacing:.06em; padding:0 32px; text-transform:uppercase; }
        .ticker-dot { color:#00FF7F; margin:0 12px; }

        /* Mobile drawer */
        .mobile-drawer { position:fixed; inset:0; z-index:200; display:flex; flex-direction:column; background:#080A0F; transform:translateX(100%); transition:transform .35s cubic-bezier(.4,0,.2,1); }
        .mobile-drawer.open { transform:translateX(0); }

        /* Responsive grids */
        .hero-grid   { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }
        .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .steps-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; position:relative; }
        .testi-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .price-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; max-width:960px; margin:0 auto; }
        .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:52px; margin-bottom:52px; }

        .nav-links   { display:flex; gap:32px; align-items:center; }
        .nav-auth    { display:flex; gap:10px; align-items:center; }
        .hamburger   { display:none; background:none; border:none; color:#E8E8E0; cursor:pointer; padding:4px; align-items:center; }
        .steps-line  { position:absolute; top:28px; left:13%; right:13%; height:1px; background:linear-gradient(90deg,transparent,#00FF7F30,#00FF7F50,#00FF7F30,transparent); pointer-events:none; }

        /* Tablet ≤ 920px */
        @media (max-width:920px) {
          .hero-grid   { grid-template-columns:1fr; gap:48px; }
          .hero-mockup { max-width:500px; margin:0 auto; width:100%; }
          .features-grid { grid-template-columns:repeat(2,1fr); }
          .steps-grid  { grid-template-columns:repeat(2,1fr); gap:28px; }
          .steps-line  { display:none; }
          .testi-grid  { grid-template-columns:1fr 1fr; }
          .price-grid  { grid-template-columns:1fr; max-width:440px; }
          .footer-grid { grid-template-columns:1fr 1fr; gap:36px; }
          .nav-links   { display:none; }
          .nav-auth    { display:none; }
          .hamburger   { display:flex; }
        }

        /* Mobile ≤ 600px */
        @media (max-width:600px) {
          .features-grid { grid-template-columns:1fr; }
          .steps-grid  { grid-template-columns:1fr; gap:20px; }
          .testi-grid  { grid-template-columns:1fr; }
          .footer-grid { grid-template-columns:1fr; gap:32px; }
          .price-grid  { max-width:100%; }
          .cta-btns    { flex-direction:column !important; }
          .cta-btns button { width:100% !important; justify-content:center !important; }
          .stats-row   { gap:20px !important; flex-wrap:wrap; }
          .inline-cta  { flex-direction:column !important; align-items:flex-start !important; padding:24px !important; }
          .footer-bottom { flex-direction:column !important; align-items:flex-start !important; }
          .final-cta-btns { flex-direction:column; align-items:center; }
          .final-cta-btns button { width:100%; max-width:320px; justify-content:center; }
        }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.9);opacity:0} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>

      {/* NAV */}
      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: scrolled ? 'rgba(8,10,15,.93)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid #1A1D25' : '1px solid transparent', transition:'all .4s' }}>
        <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:66 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#00FF7F,#00C8FF)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:17 }}>📖</span>
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, letterSpacing:'-0.01em', lineHeight:1 }}>Mtihani Kenya</div>
              <div style={{ fontSize:9, color:'#5A5D65', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Space Mono' }}>Exam Craft</div>
            </div>
          </div>

          <nav className="nav-links">
            {['features','how-it-works','testimonials','pricing'].map(s => (
              <button key={s} className="nav-link" onClick={() => scroll(s)} style={{ textTransform:'capitalize' }}>{s.replace('-',' ')}</button>
            ))}
          </nav>

          <div className="nav-auth">
            <button className="btn-ghost" onClick={onSignIn} style={{ padding:'9px 20px' }}>Sign In</button>
            <button className="btn-primary" onClick={onGetStarted} style={{ padding:'9px 20px' }}>Get Started <ArrowRight size={13}/></button>
          </div>

          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={24}/></button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #1A1D25' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#00FF7F,#00C8FF)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:15 }}>📖</span></div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15 }}>Mtihani Kenya</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background:'none', border:'none', color:'#E8E8E0', cursor:'pointer', padding:4 }} aria-label="Close menu"><X size={22}/></button>
        </div>
        <nav style={{ flex:1, padding:'28px 24px', display:'flex', flexDirection:'column', gap:4 }}>
          {['features','how-it-works','testimonials','pricing'].map(s => (
            <button key={s} onClick={() => scroll(s)} style={{ textAlign:'left', background:'none', border:'none', borderBottom:'1px solid #1A1D25', color:'#B8B8B0', fontSize:22, fontWeight:600, fontFamily:"'Syne',sans-serif", cursor:'pointer', padding:'14px 0', textTransform:'capitalize', letterSpacing:'-0.01em' }}>
              {s.replace('-',' ')}
            </button>
          ))}
        </nav>
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:10, borderTop:'1px solid #1A1D25' }}>
          <button className="btn-ghost" onClick={() => { onSignIn(); setMenuOpen(false); }} style={{ justifyContent:'center', padding:'13px' }}>Sign In</button>
          <button className="btn-primary" onClick={() => { onGetStarted(); setMenuOpen(false); }} style={{ justifyContent:'center', padding:'13px' }}>Get Started <ArrowRight size={14}/></button>
        </div>
      </div>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', paddingTop:96, paddingBottom:72, overflow:'hidden' }}>
        <GlowOrb style={{ width:560, height:560, background:'radial-gradient(circle,#00FF7F18 0%,transparent 70%)', top:'5%', left:'-15%' }}/>
        <GlowOrb style={{ width:360, height:360, background:'radial-gradient(circle,#00C8FF12 0%,transparent 70%)', top:'40%', right:'-8%' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#1A1D2510 1px,transparent 1px),linear-gradient(90deg,#1A1D2510 1px,transparent 1px)', backgroundSize:'60px 60px', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1, width:'100%' }}>
          <div className="hero-grid">
            <div>
              <FadeIn delay={0}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'7px 16px', borderRadius:100, border:'1px solid #00FF7F30', background:'#00FF7F08', marginBottom:26 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#00FF7F', boxShadow:'0 0 0 4px #00FF7F20', animation:'pulse-ring 2s ease-out infinite' }}/>
                  <span style={{ fontSize:12, color:'#00FF7F', fontWeight:500, fontFamily:'Space Mono' }}>🇰🇪 Kenya Curriculum Platform</span>
                </div>
              </FadeIn>
              <FadeIn delay={80}>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(34px,5.5vw,64px)', lineHeight:1.06, letterSpacing:'-0.03em', marginBottom:18 }}>
                  Create Pro Exams<br/><span className="gradient-text">in Minutes</span><br/>with AI.
                </h1>
              </FadeIn>
              <FadeIn delay={160}>
                <p style={{ fontSize:'clamp(15px,2vw,17px)', color:'#7A7A70', lineHeight:1.7, marginBottom:32, maxWidth:460 }}>
                  Generate curriculum-aligned exams with topic selection, mark distribution, and professional cover pages. Built for Kenyan educators following CBC and 8-4-4 systems.
                </p>
              </FadeIn>
              <FadeIn delay={240}>
                <div className="cta-btns" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:44 }}>
                  <button className="btn-primary" onClick={onGetStarted} style={{ fontSize:15, padding:'13px 28px' }}><Rocket size={15}/> Try It Free</button>
                  <button className="btn-ghost" style={{ fontSize:15, padding:'13px 28px' }}><PlayCircle size={15}/> Watch Demo</button>
                </div>
              </FadeIn>
              <FadeIn delay={320}>
                <div className="stats-row" style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
                  {[
                    { val: publicStats.examsCreated, suffix: '+', label: 'Exams Created' },
                    { val: publicStats.educators,    suffix: '+', label: 'Educators'     },
                    { val: publicStats.satisfaction, suffix: '%', label: 'Satisfaction'  },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3vw,30px)', color:'#00FF7F', lineHeight:1 }}>
                        <Counter target={s.val || 0} suffix={s.suffix}/>
                      </div>
                      <div style={{ fontSize:12, color:'#5A5D65', marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={160}>
              <div className="hero-mockup" style={{ position:'relative' }}>
                <div style={{ animation:'float 6s ease-in-out infinite', position:'relative', zIndex:2 }}>
                  <div style={{ background:'#0D0F16', border:'1px solid #2A2D35', borderRadius:20, overflow:'hidden', boxShadow:'0 32px 100px #00000080,0 0 50px #00FF7F0D' }}>
                    <div style={{ background:'#080A0F', padding:'12px 18px', display:'flex', alignItems:'center', gap:7, borderBottom:'1px solid #1A1D25' }}>
                      {['#FF5F57','#FFBD2E','#28CA41'].map(c => <div key={c} style={{ width:9, height:9, borderRadius:'50%', background:c }}/>)}
                      <span style={{ marginLeft:10, fontSize:11, color:'#3A3D45', fontFamily:'Space Mono' }}>mtihani — exam-builder</span>
                    </div>
                    <div style={{ padding:'20px 22px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                        <div>
                          <div style={{ fontSize:10, color:'#5A5D65', fontFamily:'Space Mono', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>New Exam</div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>Form 3 Mathematics</div>
                          <div style={{ fontSize:12, color:'#5A5D65', marginTop:2 }}>CBC · 2 Hours · 100 Marks</div>
                        </div>
                        <div style={{ padding:'5px 11px', background:'#00FF7F15', border:'1px solid #00FF7F30', borderRadius:100, fontSize:10, color:'#00FF7F', fontFamily:'Space Mono' }}>ACTIVE</div>
                      </div>
                      <div style={{ marginBottom:16 }}>
                        <div style={{ fontSize:10, color:'#4A4D55', fontFamily:'Space Mono', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:9 }}>Topics Selected</div>
                        {[{topic:'Quadratic Equations',marks:30,color:'#00FF7F'},{topic:'Trigonometry',marks:25,color:'#00C8FF'},{topic:'Statistics',marks:25,color:'#9B6BFF'},{topic:'Vectors',marks:20,color:'#FF9B3B'}].map(t => (
                          <div key={t.topic} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                            <div style={{ width:7, height:7, borderRadius:'50%', background:t.color, flexShrink:0 }}/>
                            <div style={{ flex:1, fontSize:12, color:'#B8B8B0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.topic}</div>
                            <div style={{ fontSize:11, fontFamily:'Space Mono', color:t.color, flexShrink:0 }}>{t.marks}mk</div>
                            <div style={{ width:56, height:3, background:'#1A1D25', borderRadius:2, overflow:'hidden', flexShrink:0 }}>
                              <div style={{ width:`${t.marks}%`, height:'100%', background:t.color, opacity:.7 }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <div style={{ flex:1, background:'#00FF7F', borderRadius:9, padding:'11px 0', textAlign:'center', color:'#080A0F', fontWeight:700, fontSize:13 }}>✦ Generate Exam</div>
                        <div style={{ width:38, height:38, background:'#1A1D25', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#5A5D65', fontSize:16, flexShrink:0 }}>⚙</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ position:'absolute', top:-14, right:-14, background:'#0D0F16', border:'1px solid #00FF7F30', borderRadius:11, padding:'9px 14px', boxShadow:'0 8px 28px #00000060', zIndex:3 }}>
                  <div style={{ fontSize:10, color:'#5A5D65', fontFamily:'Space Mono' }}>AI Generated</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#00FF7F' }}>48 questions</div>
                </div>
                <div style={{ position:'absolute', bottom:14, left:-16, background:'#0D0F16', border:'1px solid #00C8FF30', borderRadius:11, padding:'9px 14px', boxShadow:'0 8px 28px #00000060', zIndex:3 }}>
                  <div style={{ fontSize:10, color:'#5A5D65', fontFamily:'Space Mono' }}>Time saved</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#00C8FF' }}>3.2 hours</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:'#3A3D45', animation:'float 3s ease-in-out infinite' }}>
          <div style={{ fontSize:10, fontFamily:'Space Mono', letterSpacing:'0.1em', textTransform:'uppercase' }}>Scroll</div>
          <ChevronDown size={13}/>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {Array(4).fill(['CBC Aligned','AI-Powered','8-4-4 Curriculum','Professional Cover Pages','Mark Distribution','Export to PDF','Question Bank','Kenyan Educators']).flat().map((t,i) => (
            <span key={i} className="ticker-item">{t}<span className="ticker-dot">✦</span></span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding:'96px 24px', position:'relative' }}>
        <GlowOrb style={{ width:500, height:500, background:'radial-gradient(circle,#00FF7F0A 0%,transparent 70%)', top:'20%', right:'-10%' }}/>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <FadeIn>
            <span className="section-eyebrow">Features</span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,48px)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:14, maxWidth:540 }}>
              Everything you need to create perfect exams.
            </h2>
            <p style={{ color:'#6A6A62', fontSize:'clamp(14px,1.8vw,17px)', maxWidth:480, marginBottom:52, lineHeight:1.6 }}>
              Powerful tools built specifically for Kenyan educators following modern curriculum standards.
            </p>
          </FadeIn>
          <div className="features-grid">
            {FEATURES.map((f,i) => (
              <FadeIn key={i} delay={i * 65}>
                <div className="feature-card">
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ width:42, height:42, borderRadius:11, background:'#1A2218', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #00FF7F20' }}>
                      <f.icon size={19} color="#00FF7F"/>
                    </div>
                    <span className="tag" style={{ background:'#1A1D25', color:'#4A4D55' }}>{f.tag}</span>
                  </div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:8, letterSpacing:'-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize:13, color:'#6A6A62', lineHeight:1.7 }}>{f.desc}</p>
                  <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:5, color:'#00FF7F', fontSize:12, fontWeight:500 }}>Learn more <ArrowRight size={11}/></div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:'96px 24px', background:'#06080C', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px,#1A1D2520 1px,transparent 0)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>
        <GlowOrb style={{ width:500, height:500, background:'radial-gradient(circle,#00C8FF0A 0%,transparent 70%)', bottom:0, left:'30%' }}/>
        <div style={{ maxWidth:1240, margin:'0 auto', position:'relative', zIndex:1 }}>
          <FadeIn>
            <span className="section-eyebrow">Process</span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,48px)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:60, maxWidth:460 }}>
              From blank page to finished exam in four steps.
            </h2>
          </FadeIn>
          <div className="steps-grid">
            <div className="steps-line"/>
            {STEPS.map((s,i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div style={{ width:52, height:52, borderRadius:13, background:'#0D0F16', border:'1px solid #2A2D35', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontFamily:'Space Mono', fontWeight:700, fontSize:16, color:'#00FF7F' }}>{s.n}</span>
                  </div>
                  <div>
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, marginBottom:7, letterSpacing:'-0.01em' }}>{s.title}</h3>
                    <p style={{ fontSize:13, color:'#6A6A62', lineHeight:1.7 }}>{s.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={320}>
            <div className="inline-cta" style={{ marginTop:64, padding:'32px 40px', background:'#0D1410', border:'1px solid #00FF7F20', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:18 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(17px,2.5vw,21px)', marginBottom:5 }}>Ready to see it in action?</div>
                <div style={{ color:'#6A6A62', fontSize:14 }}>Create your first AI-powered exam in under 5 minutes.</div>
              </div>
              <button className="btn-primary" onClick={onGetStarted} style={{ fontSize:14, padding:'12px 26px' }}>Start Building <ArrowRight size={13}/></button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ padding:'96px 24px' }}>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <FadeIn>
            <span className="section-eyebrow">Testimonials</span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,48px)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:52, maxWidth:440 }}>
              Trusted by educators across Kenya.
            </h2>
          </FadeIn>
          <div className="testi-grid">
            {TESTIMONIALS.map((t,i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="testimonial-card">
                  <div style={{ display:'flex', gap:3, marginBottom:16 }}>{Array(5).fill(0).map((_,j) => <span key={j} style={{ color:'#00FF7F', fontSize:13 }}>★</span>)}</div>
                  <p style={{ fontSize:14, color:'#9A9A90', lineHeight:1.75, marginBottom:22, fontStyle:'italic' }}>"{t.text}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12, borderTop:'1px solid #1A1D25', paddingTop:16 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#00FF7F30,#00C8FF30)', border:'1px solid #00FF7F30', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Mono', fontWeight:700, fontSize:11, color:'#00FF7F', flexShrink:0 }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{t.author}</div>
                      <div style={{ fontSize:12, color:'#5A5D65' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={240}>
            <div style={{ marginTop:52, display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
              {[{icon:Zap,text:'No setup required'},{icon:Shield,text:'Curriculum verified'},{icon:Clock,text:'Save 3+ hours per exam'}].map(({icon:Icon,text}) => (
                <div key={text} style={{ display:'flex', alignItems:'center', gap:8, color:'#6A6A62', fontSize:14 }}><Icon size={14} color="#00FF7F"/> {text}</div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:'96px 24px', background:'#06080C', position:'relative' }}>
        <GlowOrb style={{ width:600, height:600, background:'radial-gradient(circle,#9B6BFF08 0%,transparent 70%)', top:0, left:'20%' }}/>
        <div style={{ maxWidth:1240, margin:'0 auto', position:'relative', zIndex:1 }}>
          <FadeIn>
            <span className="section-eyebrow">Pricing</span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(26px,4vw,48px)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:10, maxWidth:420 }}>Simple, transparent pricing.</h2>
            <p style={{ color:'#6A6A62', fontSize:'clamp(14px,1.8vw,17px)', marginBottom:52 }}>No hidden fees. Cancel anytime.</p>
          </FadeIn>
          <div className="price-grid">
            {PLANS.map((plan,i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="plan-card" style={plan.highlighted ? { background:'linear-gradient(180deg,#0F1F14 0%,#0A1810 100%)', border:'1px solid #00FF7F40', boxShadow:'0 0 60px #00FF7F10,inset 0 1px 0 #00FF7F20' } : { background:'#0D0F16', border:'1px solid #1A1D25' }}>
                  {plan.highlighted && <div style={{ marginBottom:16 }}><span className="tag" style={{ background:'#00FF7F20', color:'#00FF7F' }}>Most Popular</span></div>}
                  <div style={{ fontSize:12, color:'#6A6A62', marginBottom:5, fontFamily:'Space Mono', letterSpacing:'0.04em' }}>{plan.name.toUpperCase()}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:5 }}>
                    <span style={{ fontSize:12, color:'#4A4D55' }}>KSh</span>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(30px,4vw,40px)', letterSpacing:'-0.03em', color: plan.highlighted ? '#00FF7F' : '#E8E8E0' }}>{plan.price}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#4A4D55', marginBottom:22 }}>/month</div>
                  <div style={{ height:1, background:'#1A1D25', marginBottom:22 }}/>
                  <ul style={{ listStyle:'none', marginBottom:26 }}>
                    {plan.features.map((f,j) => (
                      <li key={j} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10, fontSize:13, color:'#9A9A90' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background: plan.highlighted ? '#00FF7F20' : '#1A1D25', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <CheckCircle size={9} color={plan.highlighted ? '#00FF7F' : '#4A4D55'}/>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={plan.highlighted ? 'btn-primary' : 'btn-ghost'} onClick={plan.highlighted ? onGetStarted : undefined} style={{ width:'100%', justifyContent:'center', padding:'12px 0', fontSize:14 }}>
                    {plan.cta} {plan.highlighted && <ArrowRight size={13}/>}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding:'96px 24px', position:'relative', overflow:'hidden' }}>
        <GlowOrb style={{ width:700, height:700, background:'radial-gradient(circle,#00FF7F0C 0%,transparent 60%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>
        <div style={{ maxWidth:740, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <FadeIn>
            <span className="section-eyebrow">Get Started Today</span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(28px,5vw,56px)', letterSpacing:'-0.03em', lineHeight:1.06, marginBottom:18 }}>
              Transform how you build exams — <span className="gradient-text">forever.</span>
            </h2>
            <p style={{ fontSize:'clamp(14px,1.8vw,17px)', color:'#6A6A62', lineHeight:1.7, maxWidth:460, margin:'0 auto 40px' }}>
              Join thousands of Kenyan educators saving time and delivering better curriculum-aligned exams.
            </p>
            <div className="final-cta-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn-primary" onClick={onGetStarted} style={{ fontSize:15, padding:'14px 32px' }}><Rocket size={15}/> Start Free Trial</button>
              <button className="btn-ghost" style={{ fontSize:15, padding:'14px 32px' }}>Book a Demo</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid #1A1D25', padding:'52px 24px 32px' }}>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <div className="footer-grid">
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#00FF7F,#00C8FF)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:15 }}>📖</span></div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14 }}>Mtihani Kenya</div>
                  <div style={{ fontSize:9, color:'#4A4D55', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'Space Mono' }}>Exam Craft</div>
                </div>
              </div>
              <p style={{ color:'#4A4D55', fontSize:13, lineHeight:1.7, maxWidth:230 }}>AI-powered exam generation for Kenyan educators. Create professional, curriculum-aligned exams in minutes.</p>
            </div>
            {[
              { title:'Product',   links:['Features','Pricing','Use Cases','Updates'] },
              { title:'Resources', links:['Documentation','Tutorials','Blog','Community'] },
              { title:'Company',   links:['About Us','Contact','Privacy Policy','Terms of Service'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily:'Space Mono', fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#4A4D55', marginBottom:16 }}>{col.title}</div>
                <ul style={{ listStyle:'none' }}>
                  {col.links.map(l => (
                    <li key={l} style={{ marginBottom:9 }}>
                      <a href="#" style={{ color:'#5A5D65', fontSize:13, textDecoration:'none', transition:'color .2s' }}
                        onMouseEnter={e => e.target.style.color='#E8E8E0'}
                        onMouseLeave={e => e.target.style.color='#5A5D65'}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ borderTop:'1px solid #1A1D25', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div style={{ fontSize:12, color:'#3A3D45', fontFamily:'Space Mono' }}>© 2025 Mtihani Kenya Exam Craft. All rights reserved.</div>
            <div style={{ fontSize:11, color:'#3A3D45', fontFamily:'Space Mono' }}>
              Powered by{' '}
              <a href="https://nerdwaretechnologies.com/" target="_blank" rel="noopener noreferrer"
                style={{ color:'#00FF7F', textDecoration:'none', transition:'color .2s' }}
                onMouseEnter={e => e.target.style.color='#33FF99'}
                onMouseLeave={e => e.target.style.color='#00FF7F'}>
                Nerdware Systems Limited
              </a>
            </div>
            <div style={{ display:'flex', gap:18 }}>
              {['Twitter','LinkedIn','GitHub'].map(s => (
                <a key={s} href="#" style={{ fontSize:12, color:'#3A3D45', textDecoration:'none', fontFamily:'Space Mono', transition:'color .2s' }}
                  onMouseEnter={e => e.target.style.color='#00FF7F'}
                  onMouseLeave={e => e.target.style.color='#3A3D45'}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}