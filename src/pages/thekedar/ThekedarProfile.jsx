import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

export default function ThekedarProfile() {
  const { user: authUser } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [profile, setProfile] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [ratePerHour, setRatePerHour] = useState('');
  const [offeredServices, setOfferedServices] = useState([]);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [newServiceId, setNewServiceId] = useState('');
  const [newServiceRate, setNewServiceRate] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/thekedars/me').catch(() => ({ data: { success: false, data: null } })),
      api.get('/services'),
    ]).then(([pRes, sRes]) => {
      if (pRes.data.success && pRes.data.data) {
        const p = pRes.data.data;
        setProfile(p);
        setBio(p.bio || '');
        setExperience(p.experience || '');
        setLocation(p.location || '');
        setRatePerHour(p.rate_per_hour || '');
        setOfferedServices(p.services || []);
      }
      if (sRes.data.success) setAllServices(sRes.data.data);
    }).catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/thekedars/me', {
        bio,
        experience,
        location,
        rate_per_hour: Number(ratePerHour) || null,
      });
      if (res.data.success) {
        showToast('Profile updated!', 'success');
      }
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = () => {
    if (!newServiceId) return;
    const svc = allServices.find(s => s.id === newServiceId);
    if (!svc) return;
    setOfferedServices(prev => [...prev, { ...svc, custom_rate: Number(newServiceRate) || 0 }]);
    setNewServiceId('');
    setNewServiceRate('');
    setAddServiceOpen(false);
  };

  const handleRemoveService = (id) => {
    setOfferedServices(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-bg3 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-bg3 rounded-xl" />)}
        </div>
        <div className="h-96 bg-bg3 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-12 animate-in slide-up">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ap border border-accent2/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent2"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-accent">Contractor Identity</span>
        </div>
        <h1 className="font-display text-[48px] font-black text-ink tracking-tight leading-none">My Profile</h1>
        <p className="text-mid font-medium mt-2">Manage your business bio, rates, and services.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Rating', value: `${(profile?.rating_average || authUser?.rating_average || 0).toFixed(1)} ★`, accent: true },
          { label: 'Total Jobs', value: profile?.total_jobs || 0 },
          { label: 'Team Size', value: profile?.team_size || 0 },
          { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-rule rounded-2xl p-6 shadow-premium group hover:border-accent2/30 transition-all">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-2 group-hover:text-accent2 transition-colors">{stat.label}</p>
            <p className={`text-[32px] font-display font-black tracking-tight ${stat.accent ? 'text-accent2' : 'text-ink'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="bg-white border border-rule rounded-2xl p-8 mb-8 shadow-premium">
        <h2 className="text-[20px] font-display font-bold text-ink mb-8 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-accent2 rounded-full"></span>
          Operational Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Full Name</label>
            <input
              type="text"
              value={profile?.name || authUser?.name || ''}
              readOnly
              className="w-full px-4 py-3.5 rounded-xl bg-bg2 border border-rule text-ink text-[15px] font-medium outline-none cursor-not-allowed opacity-70 shadow-inner-soft"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Email Address</label>
            <input
              type="email"
              value={profile?.email || authUser?.email || ''}
              readOnly
              className="w-full px-4 py-3.5 rounded-xl bg-bg2 border border-rule text-ink text-[15px] font-medium outline-none cursor-not-allowed opacity-70 shadow-inner-soft"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Mobile Number</label>
            <input
              type="tel"
              value={profile?.mobile || authUser?.mobile || ''}
              readOnly
              className="w-full px-4 py-3.5 rounded-xl bg-bg2 border border-rule text-ink text-[15px] font-medium outline-none cursor-not-allowed opacity-70 shadow-inner-soft"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Base Rate per Hour (₹)</label>
            <input
              type="number"
              value={ratePerHour}
              onChange={e => setRatePerHour(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-4 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[15px] font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Business Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell customers about your expertise, team, and experience..."
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[15px] leading-relaxed outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Years of Experience</label>
            <input
              type="text"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              placeholder="e.g. 8 years"
              className="w-full px-4 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[15px] font-medium outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Service Location / City</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Indore, MP"
              className="w-full px-4 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[15px] font-medium outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
            />
          </div>
        </div>
      </div>

      {/* Services Offered */}
      <div className="bg-white border border-rule rounded-2xl p-8 mb-10 shadow-premium">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[20px] font-display font-bold text-ink flex items-center gap-3">
            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
            Services Offered
          </h2>
          <button
            onClick={() => setAddServiceOpen(true)}
            className="px-5 py-2.5 bg-accent text-white text-[12px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add Service
          </button>
        </div>

        {offeredServices.length === 0 ? (
          <div className="py-12 text-center bg-bg rounded-2xl border border-dashed border-rule">
            <p className="text-muted font-bold uppercase tracking-widest text-[11px]">No services listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {offeredServices.map(svc => (
              <div
                key={svc.id}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-rule bg-bg group hover:border-accent2 transition-all shadow-inner-soft"
              >
                <div>
                  <span className="block text-[15px] font-bold text-ink">{svc.name}</span>
                  {svc.custom_rate && (
                    <span className="text-[12px] font-bold text-accent2 uppercase tracking-wider">{formatCurrency(svc.custom_rate)}/hr</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveService(svc.id)}
                  className="p-2 text-muted hover:text-red transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-12 py-4 bg-accent text-white text-[15px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-3"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Updating...
            </>
          ) : 'Save Profile Changes'}
        </button>
      </div>

      {/* Add Service Modal */}
      {addServiceOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm bg-ink/60 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-premium border border-rule animate-in slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[24px] font-display font-black text-ink tracking-tight">Add Service</h3>
              <button onClick={() => setAddServiceOpen(false)} className="p-2 text-muted hover:text-ink transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Select Service</label>
                <div className="relative">
                  <select
                    value={newServiceId}
                    onChange={e => setNewServiceId(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[15px] font-medium outline-none appearance-none focus:border-accent transition-all shadow-inner-soft"
                  >
                    <option value="">Choose a service category...</option>
                    {allServices.filter(s => !offeredServices.find(o => o.id === s.id)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Custom Service Rate (₹/hr)</label>
                <input
                  type="number"
                  value={newServiceRate}
                  onChange={e => setNewServiceRate(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[15px] font-bold outline-none focus:border-accent transition-all shadow-inner-soft"
                />
              </div>

              <button
                onClick={handleAddService}
                disabled={!newServiceId}
                className="w-full py-4 bg-accent text-white text-[15px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-50"
              >
                Confirm and Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
