import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'thekedar' ? '/thekedar/dashboard' : '/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (location.state?.registered) {
      setSuccess('Account created! Please login.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login', form);
      const meRes = await api.get('/auth/me');
      const loggedInUser = meRes.data.data;
      login(loggedInUser);
      setSuccess(`Welcome back, ${loggedInUser.name}!`);
      setTimeout(() => {
        navigate(loggedInUser.role === 'thekedar' ? '/thekedar/dashboard' : '/');
      }, 800);
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-64px)] bg-bg">
      {/* LEFT PANEL: Branding & Social Proof */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-accent p-16">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent2 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">Secure Portal</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display font-black leading-[0.9] tracking-tight text-white mb-6" style={{ fontSize: 'clamp(48px, 6vw, 84px)' }}>
            Welcome <br />
            <span className="text-accent3 italic font-medium">back.</span>
          </h1>
          <p className="text-[18px] text-white/60 max-w-sm leading-relaxed font-medium">
            Log in to manage your service requests or your contractor dashboard.
          </p>
        </div>

        <div className="relative z-10 space-y-4 max-w-sm">
          {[
            { n: '2.4k+', t: 'Verified Contractors' },
            { n: '18k+', t: 'Successful Jobs' },
            { n: '4.8★', t: 'Platform Rating' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all">
              <span className="font-display text-[24px] font-black text-accent2">{item.n}</span>
              <p className="text-[13px] font-bold text-white/70 uppercase tracking-widest">{item.t}</p>
            </div>
          ))}
        </div>

        {/* Abstract Background Element */}
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-accent2/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* RIGHT PANEL: The Form */}
      <div className="flex items-center justify-center p-8 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-[420px] animate-in slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-display font-black text-lg">K</div>
            <span className="font-display text-xl font-bold tracking-tight text-ink">KarigarNow</span>
          </div>

          <div className="mb-10">
            <h2 className="font-display text-[36px] font-black tracking-tight text-ink mb-2">Sign in</h2>
            <p className="text-mid font-medium">
              New to KarigarNow? <Link to="/register" className="text-accent2 font-bold hover:underline">Create an account</Link>
            </p>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-gbg border border-green/20 text-green text-[13px] font-bold mb-8 flex items-center gap-3 animate-in fade-in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-mid uppercase tracking-widest px-0.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[15px]"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-[12px] font-bold text-mid uppercase tracking-widest">Password</label>
                <button type="button" className="text-[11px] font-bold text-muted hover:text-accent2 transition-colors uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-rule bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all shadow-inner-soft text-[15px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted hover:text-ink transition-colors uppercase tracking-widest"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rbg border border-red/20 text-red text-[13px] font-bold flex items-center gap-3 animate-in fade-in">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-rule/50">
            <p className="text-center text-[12px] text-muted font-medium">
              By signing in, you agree to our <br/>
              <a href="#" className="text-mid hover:text-ink transition-colors underline">Terms of Service</a> and <a href="#" className="text-mid hover:text-ink transition-colors underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
