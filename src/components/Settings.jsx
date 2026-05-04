import { useState, useEffect, useRef } from 'react';
import {
  Save, User, Settings as SettingsIcon, Bell, Clock,
  Check, AlertCircle, Shield, Trash2, Upload, Download,
  RefreshCw, Palette, Monitor, Sun, Moon, LogOut, Key,
  Globe, Volume2, VolumeX, Zap, Database, X, CheckCircle,
  ChevronRight
} from 'lucide-react';
import { useGlobals } from './Globals';
import AdBanner from './AdBanner';

/* ─── shared input primitives ────────────────────────────── */
const LABEL = { display:'block', fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:7 };

const FInput = ({ value, onChange, placeholder, type='text', readOnly }) => {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value||''} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ width:'100%', padding:'10px 12px', background: readOnly?'#0A0C11':f?'#0F1410':'#080A0F', border:`1px solid ${f&&!readOnly?'#00FF7F50':'#1A1D25'}`, borderRadius:10, color: readOnly?'#5A5D65':'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'all .2s', boxSizing:'border-box', cursor: readOnly?'not-allowed':'text', boxShadow: f&&!readOnly?'0 0 0 3px #00FF7F0D':'none' }}
    />
  );
};

const FSelect = ({ value, onChange, children }) => {
  const [f, setF] = useState(false);
  return (
    <select value={value||''} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{ width:'100%', padding:'10px 12px', background: f?'#0F1410':'#080A0F', border:`1px solid ${f?'#00FF7F50':'#1A1D25'}`, borderRadius:10, color:'#E8E8E0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer', appearance:'none', transition:'all .2s', boxSizing:'border-box', boxShadow: f?'0 0 0 3px #00FF7F0D':'none' }}>
      {children}
    </select>
  );
};

/* ─── toggle switch ──────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <label style={{ position:'relative', display:'inline-flex', alignItems:'center', cursor:'pointer', flexShrink:0 }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ position:'absolute', opacity:0, width:0, height:0 }}/>
    <div style={{ width:42, height:24, borderRadius:12, background: checked?'#00FF7F':'#1A1D25', border:`1px solid ${checked?'#00FF7F60':'#2A2D35'}`, transition:'all .25s', position:'relative' }}>
      <div style={{ position:'absolute', top:3, left: checked?18:3, width:16, height:16, borderRadius:'50%', background: checked?'#080A0F':'#4A4D55', transition:'left .25s' }}/>
    </div>
  </label>
);

/* ─── toggle row ─────────────────────────────────────────── */
const ToggleRow = ({ icon: Icon, title, desc, checked, onChange, accent='#00FF7F' }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:12, gap:16 }}>
    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
      <div style={{ width:34, height:34, borderRadius:9, background:`${accent}15`, border:`1px solid ${accent}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={15} color={accent}/>
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:500, color:'#E8E8E0', marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:12, color:'#4A4D55' }}>{desc}</div>
      </div>
    </div>
    <Toggle checked={!!checked} onChange={onChange}/>
  </div>
);

/* ─── action card ────────────────────────────────────────── */
const ActionCard = ({ icon: Icon, title, desc, children, accent='#6A6A62' }) => (
  <div style={{ padding:'18px 20px', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
      <div style={{ width:32, height:32, borderRadius:8, background:`${accent}15`, border:`1px solid ${accent}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={14} color={accent}/>
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:'#E8E8E0' }}>{title}</div>
        <div style={{ fontSize:12, color:'#4A4D55' }}>{desc}</div>
      </div>
    </div>
    {children}
  </div>
);

/* ─── info card ──────────────────────────────────────────── */
const InfoCard = ({ accent, icon: Icon, title, children }) => (
  <div style={{ padding:'16px 18px', background:`${accent}0A`, border:`1px solid ${accent}25`, borderRadius:12, marginBottom:20 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      <Icon size={15} color={accent}/>
      <span style={{ fontSize:13, fontWeight:600, color: accent }}>{title}</span>
    </div>
    {children}
  </div>
);

/* ─── confirm dialog ─────────────────────────────────────── */
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDangerous=false }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (isOpen) requestAnimationFrame(()=>setMounted(true)); else setMounted(false); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(4,5,8,.88)', backdropFilter:'blur(6px)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20, opacity:mounted?1:0, transition:'opacity .22s' }}>
      <div style={{ background:'#0D0F16', border:'1px solid #2A2D35', borderRadius:18, padding:'28px 28px', maxWidth:420, width:'100%', boxShadow:'0 40px 120px rgba(0,0,0,.8)', animation:'cdSlide .25s cubic-bezier(.16,1,.3,1) forwards' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#E8E8E0', marginBottom:10, letterSpacing:'-0.02em' }}>{title}</div>
        <p style={{ fontSize:13, color:'#6A6A62', lineHeight:1.7, marginBottom:24 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose}
            style={{ padding:'9px 20px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}>Cancel</button>
          <button onClick={onConfirm}
            style={{ padding:'9px 20px', background: isDangerous?'#FF4444':'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

/* ─── upgrade modal ──────────────────────────────────────── */
const UpgradeModal = ({ onClose }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(()=>setMounted(true)); }, []);
  const backdropRef = useRef(null);
  const PLANS = [
    { name:'Free',         price:'KSh 0',          period:'',        features:['2 exams per month','Basic access','Limited support'],                              highlight:false, cta:'Current' },
    { name:'Standard',     price:'KSh 499',         period:'/month',  features:['10 exams per month','Priority grading','Email support'],                          highlight:true,  cta:'Upgrade' },
    { name:'Premium',      price:'KSh 999',         period:'/month',  features:['Unlimited exams','Advanced analytics','24/7 support'],                            highlight:false, cta:'Upgrade' },
  ];
  return (
    <div ref={backdropRef} onClick={e=>{if(e.target===backdropRef.current)onClose();}}
      style={{ position:'fixed', inset:0, background:'rgba(4,5,8,.88)', backdropFilter:'blur(6px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20, opacity:mounted?1:0, transition:'opacity .22s' }}>
      <div style={{ background:'#0D0F16', border:'1px solid #2A2D35', borderRadius:20, padding:'28px', maxWidth:700, width:'100%', boxShadow:'0 40px 120px rgba(0,0,0,.8)', position:'relative', animation:'cdSlide .28s cubic-bezier(.16,1,.3,1) forwards' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid #1A1D25', borderRadius:8, color:'#4A4D55', cursor:'pointer' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#FF444415';e.currentTarget.style.color='#FF6666';}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#4A4D55';}}><X size={13}/></button>
        <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.1em', color:'#00FF7F', marginBottom:8 }}>Upgrade Plan</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:'-0.02em', color:'#E8E8E0', marginBottom:6 }}>Choose a plan that fits you</div>
        <p style={{ fontSize:13, color:'#6A6A62', marginBottom:24 }}>Unlock more exams, priority support, and advanced analytics.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ background: plan.highlight?'#0D1410':'#080A0F', border:`1px solid ${plan.highlight?'#00FF7F40':'#1A1D25'}`, borderRadius:14, padding:'20px 18px', boxShadow: plan.highlight?'0 0 40px #00FF7F0C':'none' }}>
              {plan.highlight && <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', color:'#00FF7F', background:'#00FF7F15', border:'1px solid #00FF7F30', padding:'3px 10px', borderRadius:100, display:'inline-block', marginBottom:10 }}>Popular</div>}
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#E8E8E0', marginBottom:4 }}>{plan.name}</div>
              <div style={{ marginBottom:14 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color: plan.highlight?'#00FF7F':'#E8E8E0' }}>{plan.price}</span>
                <span style={{ fontSize:12, color:'#4A4D55' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle:'none', marginBottom:16 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#7A7A70', marginBottom:6 }}>
                    <CheckCircle size={11} color={plan.highlight?'#00FF7F':'#3A3D45'}/> {f}
                  </li>
                ))}
              </ul>
              <button style={{ width:'100%', padding:'9px 0', background: plan.highlight?'#00FF7F':'transparent', border:`1px solid ${plan.highlight?'#00FF7F':'#1A1D25'}`, borderRadius:100, color: plan.highlight?'#080A0F':'#6A6A62', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e=>{ if(!plan.highlight){e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';} else e.currentTarget.style.background='#33FF99'; }}
                onMouseLeave={e=>{ if(!plan.highlight){e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';} else e.currentTarget.style.background='#00FF7F'; }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:12, color:'#4A4D55', marginBottom:10 }}>Select payment method:</div>
          <div style={{ display:'flex', gap:10 }}>
            {[{label:'M-Pesa',color:'#00C8FF'},{label:'PayPal',color:'#9B6BFF'}].map(p=>(
              <button key={p.label} style={{ padding:'8px 20px', background:`${p.color}15`, border:`1px solid ${p.color}30`, borderRadius:100, color:p.color, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=`${p.color}28`}
                onMouseLeave={e=>e.currentTarget.style.background=`${p.color}15`}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN Settings component
═══════════════════════════════════════════════════════════ */
const Settings = () => {
  const { user, getUserPreferences, updateUserPreferences, showNotification, apiRequest } = useGlobals();
  const [settings, setSettings]               = useState(null);
  const [activeTab, setActiveTab]             = useState('profile');
  const [isSaving, setIsSaving]               = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isExporting, setIsExporting]         = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [saveStatus, setSaveStatus]           = useState(null); // 'success' | 'error' | null
  const importRef = useRef(null);

  const TABS = [
    { id:'profile',       name:'Profile',           icon:User         },
    { id:'exam',          name:'Exam Preferences',  icon:Clock        },
    { id:'notifications', name:'Notifications',     icon:Bell         },
    { id:'system',        name:'System',            icon:SettingsIcon },
    { id:'security',      name:'Security',          icon:Shield       },
  ];

  /* load */
  useEffect(() => {
    (async () => {
      const prefs = await getUserPreferences();
      if (prefs) {
        setSettings(prefs);
        setInitialSettings(JSON.parse(JSON.stringify(prefs)));
        applyTheme(prefs.theme);
      }
    })();
  }, [getUserPreferences]);

  /* track unsaved changes */
  useEffect(() => {
    if (settings && initialSettings) {
      setHasUnsavedChanges(JSON.stringify(settings) !== JSON.stringify(initialSettings));
    }
  }, [settings, initialSettings]);

  /* system theme listener */
  useEffect(() => {
    if (settings?.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = () => applyTheme('system');
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [settings?.theme]);

  const applyTheme = (t) => {
    let theme = t;
    if (theme === 'system') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.remove('light','dark');
    document.documentElement.classList.add(theme);
  };

  const upd = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  /* save */
  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true); setSaveStatus(null);
    try {
      const res = await updateUserPreferences(settings);
      if (res.success) {
        setSaveStatus('success');
        setInitialSettings(JSON.parse(JSON.stringify(settings)));
        setHasUnsavedChanges(false);
        showNotification('Preferences updated successfully', 'success');
        applyTheme(settings.theme);
      } else throw new Error(res.error || 'Failed to save');
    } catch (err) {
      setSaveStatus('error');
      showNotification(err.message, 'error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  /* export */
  const exportSettings = async () => {
    if (!settings) return;
    setIsExporting(true);
    try {
      const blob = new Blob([JSON.stringify({ settings, user:{ name:user.name, email:user.email, role:user.role }, exportDate:new Date().toISOString(), version:'1.0' }, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`mtihani-settings-${user.name.replace(/\s+/g,'-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      showNotification('Settings exported to file', 'success');
    } catch { showNotification('Failed to export settings', 'error'); }
    finally { setIsExporting(false); }
  };

  /* import */
  const importSettings = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!d.settings || !d.version) throw new Error('Invalid file format');
        setSettings(p => ({ ...p, ...d.settings, userId: p.userId }));
        showNotification('Settings imported. Remember to save changes.', 'success');
      } catch { showNotification('Failed to import settings — invalid file', 'error'); }
      finally { e.target.value = ''; }
    };
    reader.onerror = () => showNotification('Failed to read file', 'error');
    reader.readAsText(file);
  };

  /* reset */
  const resetToDefaults = async () => {
    try {
      const res = await apiRequest('/api/user/preferences', { method:'DELETE' });
      if (res.success) {
        setSettings(res.preferences);
        setInitialSettings(JSON.parse(JSON.stringify(res.preferences)));
        showNotification('Settings reset to defaults', 'success');
        applyTheme(res.preferences.theme);
      } else throw new Error(res.error || 'Failed to reset');
    } catch (err) { showNotification(err.message, 'error'); }
    finally { setShowConfirmDialog(null); }
  };

  const clearAllData = () => {
    ['examSettings','examData','userPreferences','recentExams','draftExams','examHistory'].forEach(k => localStorage.removeItem(k));
    showNotification('All local data cleared', 'success');
    setShowConfirmDialog(null);
  };

  const handleChangePassword = async () => {
    try {
      const res = await apiRequest('/api/user/change-password-request', { method:'POST' });
      if (res.success) showNotification('Password reset link sent to your email', 'success');
      else throw new Error(res.error || 'Failed');
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleLogoutAllDevices = async () => {
    try {
      const res = await apiRequest('/api/user/logout-all', { method:'POST' });
      if (res.success) { showNotification('Logged out from all devices', 'success'); setTimeout(() => window.location.href='/', 2000); }
      else throw new Error(res.error || 'Failed');
    } catch (err) { showNotification(err.message, 'error'); }
    setShowConfirmDialog(null);
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await apiRequest('/api/user/account', { method:'DELETE' });
      if (res.success) { showNotification('Account deletion initiated', 'success'); setTimeout(() => window.location.href='/', 2000); }
      else throw new Error(res.error || 'Failed');
    } catch (err) { showNotification(err.message, 'error'); }
    setShowConfirmDialog(null);
  };

  const requestVerification = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/request-verification-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:user.email }) });
      const d = await res.json();
      showNotification(res.ok ? 'Verification email sent! Check your inbox.' : (d.message || 'Failed to send'), res.ok ? 'success' : 'error');
    } catch { showNotification('An error occurred. Please try again.', 'error'); }
  };

  /* ── tab content ── */
  const renderContent = () => {
    switch (activeTab) {

      case 'profile': return (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {/* read-only user fields */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
            {[['Full Name',user.name],['Email',user.email],['Phone',user.phone],['Role',user.role]].map(([lbl,val])=>(
              <div key={lbl}>
                <label style={LABEL}>{lbl}</label>
                <FInput value={val} readOnly/>
              </div>
            ))}
          </div>

          {/* account stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <InfoCard accent="#00C8FF" icon={User} title="Account Info">
              <div style={{ fontSize:12, color:'#6A6A62' }}>Member since: <span style={{ color:'#9A9A90' }}>{new Date(user.createdAt).toLocaleDateString()}</span></div>
              <div style={{ fontSize:12, color:'#6A6A62', marginTop:4 }}>Last login: <span style={{ color:'#9A9A90' }}>{new Date(user.lastLogin).toLocaleDateString()}</span></div>
            </InfoCard>
            <InfoCard accent="#FF9B3B" icon={AlertCircle} title="Profile Updates">
              <p style={{ fontSize:12, color:'#6A6A62', lineHeight:1.6 }}>To update profile information, please contact support.</p>
            </InfoCard>
          </div>

          {/* email verification */}
          <div style={{ padding:'16px 18px', background: user.isVerified?'#00FF7F0A':'#FF44440A', border:`1px solid ${user.isVerified?'#00FF7F25':'#FF444430'}`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color: user.isVerified?'#00FF7F':'#FF6666', marginBottom:4 }}>
                {user.isVerified ? '✓ Email Verified' : '✗ Email Not Verified'}
              </div>
              <div style={{ fontSize:12, color:'#5A5D65' }}>{user.isVerified ? 'Your account email is confirmed.' : 'Verify your email to unlock all features.'}</div>
            </div>
            {!user.isVerified && (
              <button onClick={requestVerification}
                style={{ padding:'9px 18px', background:'#00FF7F15', border:'1px solid #00FF7F30', borderRadius:100, color:'#00FF7F', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#00FF7F25'}
                onMouseLeave={e=>e.currentTarget.style.background='#00FF7F15'}>
                Send Verification Email
              </button>
            )}
          </div>

          <AdBanner/>

          {/* subscription */}
          <div style={{ padding:'20px', background:'#0D1410', border:'1px solid #00FF7F25', borderRadius:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#E8E8E0' }}>Subscription</div>
              <button onClick={() => setShowUpgradeModal(true)}
                style={{ padding:'8px 18px', background:'#00FF7F', border:'none', borderRadius:100, color:'#080A0F', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#33FF99'}
                onMouseLeave={e=>e.currentTarget.style.background='#00FF7F'}>
                Upgrade Plan
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'10px 24px' }}>
              {[
                ['Status', <span style={{ color: user.subscription?.status==='active'?'#00FF7F':'#FF6666', fontWeight:600 }}>{user.subscription?.status||'inactive'}</span>],
                ['Exams Remaining', user.subscription?.examsRemaining??0],
                ['Last Payment', user.subscription?.lastPayment ? new Date(user.subscription.lastPayment).toLocaleDateString() : 'None'],
              ].map(([lbl,val])=>(
                <div key={lbl}>
                  <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.08em', color:'#4A4D55', marginBottom:4 }}>{lbl}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#E8E8E0' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      case 'exam': return (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
            <div>
              <label style={LABEL}>Default Curriculum</label>
              <FSelect value={settings.defaultCurriculum} onChange={e=>upd('defaultCurriculum',e.target.value)}>
                <option value="Primary">Primary School</option>
                <option value="JSS">Junior Secondary</option>
                <option value="Secondary">Secondary School</option>
                <option value="Tertiary">Tertiary</option>
              </FSelect>
            </div>
            <div>
              <label style={LABEL}>Language</label>
              <FSelect value={settings.language} onChange={e=>upd('language',e.target.value)}>
                <option value="english">English</option>
                <option value="swahili">Swahili</option>
                <option value="french">French</option>
              </FSelect>
            </div>
            <div>
              <label style={LABEL}>Timezone</label>
              <FSelect value={settings.timezone} onChange={e=>upd('timezone',e.target.value)}>
                <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                <option value="Africa/Lagos">West Africa Time (WAT)</option>
                <option value="Africa/Cairo">Central Africa Time (CAT)</option>
                <option value="Africa/Johannesburg">South Africa (SAST)</option>
              </FSelect>
            </div>
            <div>
              <label style={LABEL}>Default Payment Method</label>
              <FSelect value={settings.paymentMethod} onChange={e=>upd('paymentMethod',e.target.value)}>
                <option value="mpesa">M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="card">Credit/Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </FSelect>
            </div>
          </div>

          {/* duration slider */}
          <div style={{ padding:'18px 20px', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'#E8E8E0', marginBottom:2 }}>Default Exam Duration</div>
                <div style={{ fontSize:12, color:'#4A4D55' }}>
                  {settings.defaultDuration < 60 ? 'Short Quiz' : settings.defaultDuration < 120 ? 'Standard Test' : 'Full Exam'}
                </div>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'#00FF7F' }}>{settings.defaultDuration} min</div>
            </div>
            <input type="range" min="30" max="240" step="15" value={settings.defaultDuration} onChange={e=>upd('defaultDuration',parseInt(e.target.value))}
              style={{ width:'100%', accentColor:'#00FF7F', height:4, cursor:'pointer' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#3A3D45', fontFamily:"'Space Mono',monospace", marginTop:6 }}>
              <span>30 min</span><span>240 min</span>
            </div>
          </div>
          <AdBanner/>
        </div>
      );

      case 'notifications': return (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <InfoCard accent="#00C8FF" icon={Bell} title="Notification Preferences">
            <p style={{ fontSize:12, color:'#6A6A62' }}>Choose how and when you want to receive notifications.</p>
          </InfoCard>
          {[
            { key:'emailNotifications', title:'Email Notifications',   desc:'Receive updates via email',                        icon:Globe,  accent:'#00C8FF' },
            { key:'pushNotifications',  title:'Push Notifications',    desc:'Browser notifications for real-time updates',      icon:Bell,   accent:'#9B6BFF' },
            { key:'weeklyReports',      title:'Weekly Reports',        desc:'Weekly summary of your exam activities',           icon:Clock,  accent:'#FF9B3B' },
            { key:'notifications',      title:'General Notifications', desc:'System updates and important announcements',       icon:AlertCircle, accent:'#00FF7F' },
          ].map(({ key, title, desc, icon, accent }) => (
            <ToggleRow key={key} icon={icon} title={title} desc={desc} checked={settings[key]} onChange={e=>upd(key,e.target.checked)} accent={accent}/>
          ))}
          <AdBanner/>
        </div>
      );

      case 'system': return (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* theme picker */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'#080A0F', border:'1px solid #1A1D25', borderRadius:12, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'#9B6BFF15', border:'1px solid #9B6BFF20', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Palette size={15} color="#9B6BFF"/>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'#E8E8E0', marginBottom:2 }}>Theme</div>
                <div style={{ fontSize:12, color:'#4A4D55' }}>Choose your preferred appearance</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[{value:'light',icon:Sun,label:'Light'},{value:'dark',icon:Moon,label:'Dark'},{value:'system',icon:Monitor,label:'System'}].map(({value,icon:Icon,label})=>{
                const active = settings.theme === value;
                return (
                  <button key={value} onClick={()=>upd('theme',value)} title={label}
                    style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:9, background: active?'#00FF7F':'transparent', border:`1px solid ${active?'#00FF7F':'#1A1D25'}`, color: active?'#080A0F':'#5A5D65', cursor:'pointer', transition:'all .2s' }}
                    onMouseEnter={e=>{if(!active){e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}}
                    onMouseLeave={e=>{if(!active){e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#5A5D65';}}}>
                    <Icon size={14}/>
                  </button>
                );
              })}
            </div>
          </div>

          {[
            { key:'autoSave',    title:'Auto-save drafts',  desc:'Automatically save exam drafts while working',    icon:Save,     accent:'#00FF7F' },
            { key:'autoBackup',  title:'Auto-backup',       desc:'Automatically backup data to cloud storage',      icon:Database, accent:'#00C8FF' },
            { key:'soundEnabled',title:'Sound effects',     desc:'Play sounds for notifications and actions',       icon:settings?.soundEnabled?Volume2:VolumeX, accent:'#FF9B3B' },
            { key:'compactMode', title:'Compact mode',      desc:'Use a more compact interface layout',             icon:Zap,      accent:'#9B6BFF' },
          ].map(({ key, title, desc, icon, accent }) => (
            <ToggleRow key={key} icon={icon} title={title} desc={desc} checked={settings[key]} onChange={e=>upd(key,e.target.checked)} accent={accent}/>
          ))}

          {/* data management */}
          <div style={{ marginTop:8, paddingTop:18, borderTop:'1px solid #1A1D25' }}>
            <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.1em', color:'#3A3D45', marginBottom:14 }}>Data Management</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
              {[
                { label: isExporting?'Exporting…':'Export Settings', icon:isExporting?RefreshCw:Download, color:'#00C8FF', onClick:exportSettings, disabled:isExporting },
                { label:'Import Settings', icon:Upload, color:'#9B6BFF', onClick:()=>importRef.current?.click() },
                { label:'Reset to Defaults', icon:RefreshCw, color:'#FF9B3B', onClick:()=>setShowConfirmDialog('reset') },
                { label:'Clear All Local Data', icon:Trash2, color:'#FF4444', onClick:()=>setShowConfirmDialog('clearData') },
              ].map(({ label, icon:Icon, color, onClick, disabled }) => (
                <button key={label} onClick={onClick} disabled={disabled}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px 0', background:`${color}10`, border:`1px solid ${color}25`, borderRadius:10, color, fontSize:12, fontWeight:500, cursor: disabled?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s', opacity:disabled?.6:1 }}
                  onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.background=`${color}20`; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=`${color}10`; }}>
                  <Icon size={13}/> {label}
                </button>
              ))}
            </div>
            <input ref={importRef} type="file" accept=".json" onChange={importSettings} style={{ display:'none' }}/>
          </div>
          <AdBanner/>
        </div>
      );

      case 'security': return (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <InfoCard accent="#FF4444" icon={Shield} title="Security & Privacy">
            <p style={{ fontSize:12, color:'#6A6A62' }}>Manage your account security and data protection settings.</p>
          </InfoCard>

          <ActionCard icon={Key} title="Password & Authentication" desc="Manage your login credentials" accent="#00C8FF">
            <button onClick={handleChangePassword}
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#00C8FF15', border:'1px solid #00C8FF30', borderRadius:100, color:'#00C8FF', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#00C8FF25'}
              onMouseLeave={e=>e.currentTarget.style.background='#00C8FF15'}>
              <Key size={12}/> Request Password Reset
            </button>
          </ActionCard>

          <ActionCard icon={Download} title="Data Export" desc="Download all your data including exams and preferences" accent="#9B6BFF">
            <button onClick={exportSettings} disabled={isExporting}
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#9B6BFF15', border:'1px solid #9B6BFF30', borderRadius:100, color:'#9B6BFF', fontSize:12, fontWeight:600, cursor: isExporting?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s', opacity:isExporting?.6:1 }}
              onMouseEnter={e=>{ if(!isExporting) e.currentTarget.style.background='#9B6BFF25'; }}
              onMouseLeave={e=>e.currentTarget.style.background='#9B6BFF15'}>
              {isExporting ? <><RefreshCw size={12} style={{ animation:'sSpin .8s linear infinite' }}/> Exporting…</> : <><Download size={12}/> Download My Data</>}
            </button>
          </ActionCard>

          <ActionCard icon={LogOut} title="Session Management" desc="Log out from all devices and revoke active sessions" accent="#FF9B3B">
            <button onClick={()=>setShowConfirmDialog('logoutAll')}
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#FF9B3B15', border:'1px solid #FF9B3B30', borderRadius:100, color:'#FF9B3B', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#FF9B3B25'}
              onMouseLeave={e=>e.currentTarget.style.background='#FF9B3B15'}>
              <LogOut size={12}/> Log Out All Devices
            </button>
          </ActionCard>

          {/* danger zone */}
          <div style={{ padding:'18px 20px', background:'#FF44440A', border:'1px solid #FF444430', borderRadius:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Trash2 size={14} color="#FF4444"/>
              <span style={{ fontSize:13, fontWeight:700, color:'#FF6666' }}>Danger Zone</span>
            </div>
            <p style={{ fontSize:12, color:'#FF888870', marginBottom:14, lineHeight:1.6 }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button onClick={()=>setShowConfirmDialog('deleteAccount')}
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#FF444420', border:'1px solid #FF444440', borderRadius:100, color:'#FF6666', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#FF444430'}
              onMouseLeave={e=>e.currentTarget.style.background='#FF444420'}>
              <Trash2 size={12}/> Delete Account
            </button>
          </div>
          <AdBanner/>
        </div>
      );
      default: return null;
    }
  };

  /* loading */
  if (!settings) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:360, gap:14 }}>
      <div style={{ width:20, height:20, border:'2px solid #1A1D25', borderTopColor:'#00FF7F', borderRadius:'50%', animation:'sSpin .8s linear infinite' }}/>
      <p style={{ fontSize:13, color:'#5A5D65', fontFamily:"'DM Sans',sans-serif" }}>Loading settings…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&family=Space+Mono&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        select option { background:#0D0F16; color:#E8E8E0; }
        input::placeholder { color:#3A3D45; }
        @keyframes sSpin  { to{transform:rotate(360deg)} }
        @keyframes cdSlide{ from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes sFadeUp{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width:800px) { .s-layout { flex-direction:column !important; } .s-sidebar { width:100% !important; } .s-tabs { display:flex !important; flex-wrap:wrap; gap:6px; } .s-tab-btn { border-left:none !important; border-bottom:2px solid transparent !important; } }
      `}</style>

      <div style={{ maxWidth:1100, margin:'0 auto', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:'#E8E8E0', animation:'sFadeUp .4s ease forwards' }}>

        {/* page header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:14 }}>
          <div>
            <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", textTransform:'uppercase', letterSpacing:'0.12em', color:'#00FF7F', marginBottom:6 }}>Account</div>
            {/* <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(22px,3vw,32px)', letterSpacing:'-0.03em', lineHeight:1.05, color:'#E8E8E0', marginBottom:4 }}>Settings</h1> */}
            <p style={{ fontSize:14, color:'#6A6A62' }}>Manage your account and preferences</p>
          </div>
          {hasUnsavedChanges && (
            <div style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', background:'#FF9B3B15', border:'1px solid #FF9B3B30', borderRadius:100, fontSize:12, color:'#FF9B3B', fontFamily:"'Space Mono',monospace" }}>
              <AlertCircle size={12}/> Unsaved changes
            </div>
          )}
        </div>

        <div className="s-layout" style={{ display:'flex', gap:24 }}>

          {/* sidebar */}
          <div className="s-sidebar" style={{ width:220, flexShrink:0 }}>
            <nav className="s-tabs" style={{ position:'sticky', top:24, display:'flex', flexDirection:'column', gap:4 }}>
              {TABS.map(({ id, name, icon:Icon }) => {
                const active = activeTab === id;
                return (
                  <button key={id} className="s-tab-btn" onClick={()=>setActiveTab(id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background: active?'#0D1410':'transparent', border:'1px solid transparent', borderLeft:`3px solid ${active?'#00FF7F':'transparent'}`, borderRadius:`0 10px 10px 0`, color: active?'#00FF7F':'#5A5D65', fontSize:13, fontWeight: active?600:400, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s', textAlign:'left' }}
                    onMouseEnter={e=>{ if(!active){e.currentTarget.style.background='#0D0F16';e.currentTarget.style.color='#B8B8B0';}}}
                    onMouseLeave={e=>{ if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#5A5D65';}}}>
                    <Icon size={14}/> {name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* main panel */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ background:'#0D0F16', border:'1px solid #1A1D25', borderRadius:16, padding:'24px 26px', minHeight:560 }}>
              {renderContent()}
            </div>
          </div>
        </div>

        {/* sticky footer */}
        <div style={{ position:'sticky', bottom:0, background:'rgba(8,10,15,.95)', backdropFilter:'blur(12px)', borderTop:'1px solid #1A1D25', padding:'14px 0', marginTop:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color: hasUnsavedChanges?'#FF9B3B':'#00FF7F', fontFamily:"'Space Mono',monospace" }}>
              {hasUnsavedChanges ? <><AlertCircle size={12}/> Unsaved changes</> : <></>}
              {saveStatus === 'success' && <span style={{ marginLeft:10, color:'#00FF7F' }}>✓ Saved!</span>}
              {saveStatus === 'error'   && <span style={{ marginLeft:10, color:'#FF6666' }}>✗ Save failed</span>}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setShowConfirmDialog('reset')}
                style={{ padding:'9px 18px', background:'transparent', border:'1px solid #1A1D25', borderRadius:100, color:'#6A6A62', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A2D35';e.currentTarget.style.color='#E8E8E0';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A1D25';e.currentTarget.style.color='#6A6A62';}}>
                Reset All
              </button>
              <button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 24px', background: (isSaving||!hasUnsavedChanges)?'#1A1D25':'#00FF7F', border:'none', borderRadius:100, color: (isSaving||!hasUnsavedChanges)?'#3A3D45':'#080A0F', fontSize:13, fontWeight:700, cursor: (isSaving||!hasUnsavedChanges)?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow: hasUnsavedChanges&&!isSaving?'0 4px 16px #00FF7F20':'none', transition:'all .2s' }}
                onMouseEnter={e=>{ if(!isSaving&&hasUnsavedChanges) e.currentTarget.style.background='#33FF99'; }}
                onMouseLeave={e=>{ if(!isSaving&&hasUnsavedChanges) e.currentTarget.style.background='#00FF7F'; }}>
                {isSaving
                  ? <><div style={{ width:13,height:13,border:'2px solid #3A3D45',borderTopColor:'#9A9A90',borderRadius:'50%',animation:'sSpin .8s linear infinite' }}/> Saving…</>
                  : <><Save size={13}/> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modals */}
      {showUpgradeModal && <UpgradeModal onClose={()=>setShowUpgradeModal(false)}/>}

      <ConfirmDialog isOpen={showConfirmDialog==='reset'}         onClose={()=>setShowConfirmDialog(null)} onConfirm={resetToDefaults}        title="Reset Settings"      message="Reset all settings to defaults? This cannot be undone."                                                                             confirmText="Reset"          isDangerous={false}/>
      <ConfirmDialog isOpen={showConfirmDialog==='clearData'}     onClose={()=>setShowConfirmDialog(null)} onConfirm={clearAllData}            title="Clear Local Data"    message="This permanently deletes all local data including settings and exam drafts. This cannot be undone."                               confirmText="Clear Data"     isDangerous={true}/>
      <ConfirmDialog isOpen={showConfirmDialog==='logoutAll'}     onClose={()=>setShowConfirmDialog(null)} onConfirm={handleLogoutAllDevices}  title="Log Out All Devices" message="This logs you out from all devices and revokes all active sessions. You will need to log in again."                             confirmText="Log Out All"   isDangerous={true}/>
      <ConfirmDialog isOpen={showConfirmDialog==='deleteAccount'} onClose={()=>setShowConfirmDialog(null)} onConfirm={handleDeleteAccount}     title="Delete Account"      message="This permanently deletes your account and ALL associated data — exams, settings, everything. This action is irreversible." confirmText="Delete Account" isDangerous={true}/>
    </>
  );
};

export default Settings;