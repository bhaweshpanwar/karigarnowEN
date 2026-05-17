import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const selectRole = r => {
    setRole(r);
    setStep(2);
  };

  const goBack = () => {
    setStep(1);
    setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
    if (!form.mobile.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(form.mobile)) return 'Mobile must be exactly 10 digits';
    if (!form.password) return 'Password is required';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(form.password))
      return 'Password must contain uppercase, lowercase, number and special character';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role,
      });
      if (res.data.success) {
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409) {
        setError(data?.message || 'Registration failed');
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-64px)] bg-bg">
      {/* LEFT PANEL: Branding & Narrative */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-accent p-16">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent2 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">Join the Network</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display font-black leading-[0.9] tracking-tight text-white mb-6" style={{ fontSize: 'clamp(48px, 6vw, 84px)' }}>
            Empowering <br />
            <span className="text-accent3 italic font-medium">labour.</span>
          </h1>
          <p className="text-[18px] text-white/60 max-w-sm leading-relaxed font-medium">
            Be part of India&apos;s most trusted ecosystem connecting skilled hands with quality projects.
          </p>
        </div>

        <div className="relative z-10 space-y-4 max-w-sm">
          {[
            { n: '01', t: 'Select your role' },
            { n: '02', t: 'Provide your verified details' },
            { n: '03', t: 'Start your journey on KarigarNow' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="font-display text-[20px] font-black text-accent2 opacity-50">{item.n}</span>
              <p className="text-[13px] font-bold text-white/70 uppercase tracking-widest">{item.t}</p>
            </div>
          ))}
        </div>

        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-accent2/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      {/* RIGHT PANEL: Steps & Form */}
      <div className="flex items-center justify-center p-8 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-[460px] animate-in slide-up">
          {/* Mobile logo & Back button */}
          <div className="lg:hidden mb-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-display font-black text-lg">K</div>
              <span className="font-display text-xl font-bold tracking-tight text-ink">KarigarNow</span>
            </div>
            {step === 2 && (
              <button onClick={goBack} className="text-[12px] font-bold text-muted hover:text-ink flex items-center gap-1 uppercase tracking-widest transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                Back
              </button>
            )}
          </div>

          {/* ── STEP 1: ROLE SELECTION ── */}
          {step === 1 && (
            <div className="animate-in fade-in">
              <div className="mb-10">
                <h2 className="font-display text-[36px] font-black tracking-tight text-ink mb-2">Create account</h2>
                <p className="text-mid font-medium">
                  Already have an account? <Link to="/login" className="text-accent2 font-bold hover:underline">Sign in</Link>
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => selectRole('consumer')}
                  className="w-full group relative text-left p-6 rounded-2xl border border-rule bg-white hover:border-accent2 hover:shadow-premium-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-bg2 flex items-center justify-center text-accent group-hover:bg-accent2 group-hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    </div>
                    <div>
                      <p className="font-display text-[18px] font-bold text-ink mb-1">I need a Service</p>
                      <p className="text-[13px] text-mid font-medium leading-relaxed">Book skilled workers for your home repairs and projects securely.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => selectRole('thekedar')}
                  className="w-full group relative text-left p-6 rounded-2xl border border-rule bg-white hover:border-accent2 hover:shadow-premium-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-bg2 flex items-center justify-center text-accent group-hover:bg-accent2 group-hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p className="font-display text-[18px] font-bold text-ink mb-1">I am a Thekedar</p>
                      <p className="text-[13px] text-mid font-medium leading-relaxed">Grow your contractor business, manage workers, and get paid on time.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: FORM ── */}
          {step === 2 && (
            <div className="animate-in slide-up">
              <div className="flex items-center justify-between mb-8">
                <div className="hidden lg:block">
                  <button onClick={goBack} className="text-[11px] font-bold text-muted hover:text-ink flex items-center gap-1 uppercase tracking-widest transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    Step back
                  </button>
                </div>
                <div className="px-3 py-1 rounded-full bg-ap border border-accent2/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                  Role: {role}
                </div>
              </div>

              <div className="mb-10">
                <h2 className="font-display text-[32px] font-black tracking-tight text-ink mb-2">Complete Profile</h2>
                <p className="text-mid font-medium">Join as a verified {role === 'consumer' ? 'customer' : 'contractor'}.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-mid uppercase tracking-widest px-0.5">Full Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[14px]"
                    placeholder="E.g. Rajesh Kumar"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-mid uppercase tracking-widest px-0.5">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[14px]"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-mid uppercase tracking-widest px-0.5">Mobile</label>
                    <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} required maxLength={10}
                      className="w-full px-4 py-3 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[14px]"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-mid uppercase tracking-widest px-0.5">Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8}
                      className="w-full px-4 py-3 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[14px]"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-mid uppercase tracking-widest px-0.5">Confirm</label>
                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[14px]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rbg border border-red/20 text-red text-[12px] font-bold flex items-center gap-3 animate-in fade-in">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-accent text-white font-bold rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[15px] mt-4"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-[11px] text-muted font-medium leading-relaxed">
                  By joining, you agree to our <br/>
                  <a href="#" className="text-mid hover:text-ink transition-colors underline">Terms</a> and <a href="#" className="text-mid hover:text-ink transition-colors underline">Privacy Policy</a>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
