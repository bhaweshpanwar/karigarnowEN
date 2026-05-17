import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ThekedarProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thekedar, setThekedar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const fetchProfile = () => {
    setLoading(true);
    setError('');
    api.get(`/thekedars/${id}`)
      .then(res => { if (res.data.success) setThekedar(res.data.data); })
      .catch(() => setError('Failed to load profile. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, [id]);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'thekedar') { showToast('You cannot book services'); return; }
    navigate(`/book/${id}`);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-bg pb-32 pt-24 px-6 lg:px-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl bg-white border border-accent2/20 text-ink text-[14px] font-bold shadow-premium animate-in slide-up">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-accent2 animate-pulse"></span>
             {toast}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-muted">
          <Link to="/" className="hover:text-accent2 transition-colors">Home</Link>
          <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          <Link to="/services" className="hover:text-accent2 transition-colors">Professionals</Link>
          <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          <span className="text-ink">{thekedar?.name || '...'}</span>
        </nav>

        {loading && (
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-white rounded-3xl border border-rule/50 shadow-sm" />
            <div className="h-32 bg-white rounded-3xl border border-rule/50 shadow-sm" />
          </div>
        )}

        {error && (
          <div className="text-center py-24 bg-white rounded-3xl border border-rule shadow-premium">
            <div className="w-16 h-16 bg-rbg rounded-full flex items-center justify-center mx-auto mb-6 text-red">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p className="text-red font-bold text-[15px] mb-6">{error}</p>
            <button onClick={fetchProfile} className="px-8 py-3 bg-bg border border-rule text-ink font-bold rounded-xl hover:border-ink transition-all">Try Again</button>
          </div>
        )}

        {thekedar && !loading && (
          <div className="animate-in slide-up">
            {/* TOP CARD */}
            <div className="bg-white rounded-[32px] border border-rule p-8 lg:p-12 mb-8 shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ap rounded-full blur-3xl -z-10 group-hover:bg-accent/5 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <div className="w-32 h-32 rounded-[32px] bg-accent text-white flex items-center justify-center font-display font-black text-[56px] shadow-premium flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                  {thekedar.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <h1 className="font-display text-[40px] font-black text-ink leading-none tracking-tight">{thekedar.name}</h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${thekedar.is_online ? 'bg-ap text-accent' : 'bg-bg2 text-muted'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${thekedar.is_online ? 'bg-accent2 animate-pulse' : 'bg-muted'}`}></span>
                      {thekedar.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-mid font-medium text-[16px] mb-4">
                    <svg className="w-4 h-4 text-accent2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {thekedar.location}
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-6">
                    <div className="flex items-center gap-1.5">
                       <span className="text-accent2 text-[20px] font-black">{thekedar.rating_average?.toFixed(1)}</span>
                       <div className="flex text-accent2">
                         {[...Array(5)].map((_, i) => (
                           <svg key={i} className={`w-4 h-4 ${i < Math.round(thekedar.rating_average) ? 'fill-current' : 'opacity-20'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                         ))}
                       </div>
                    </div>
                    <div className="h-6 w-px bg-rule/60"></div>
                    <div className="text-[13px] font-bold text-muted uppercase tracking-widest">
                       <span className="text-ink">{thekedar.total_jobs}</span> Jobs Completed
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-bg border border-rule group-hover:border-accent2/20 transition-all shadow-inner-soft">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">Industry Experience</p>
                  <p className="text-[18px] font-bold text-ink">{thekedar.experience || 'Verified Professional'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-bg border border-rule group-hover:border-accent2/20 transition-all shadow-inner-soft">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2">Active Workforce</p>
                  <p className="text-[18px] font-bold text-ink">{(thekedar.team_size || thekedar.workers?.length || 1)} Professional Workers</p>
                </div>
              </div>

              {thekedar.bio && (
                <div className="bg-ap/20 p-6 rounded-2xl border border-accent2/10">
                   <p className="text-mid text-[15px] leading-relaxed font-medium italic group-hover:text-ink transition-colors">&quot;{thekedar.bio}&quot;</p>
                </div>
              )}
            </div>

            {/* SERVICES */}
            {thekedar.services?.length > 0 && (
              <div className="bg-white rounded-[32px] border border-rule p-8 lg:p-10 mb-8 shadow-premium">
                <h2 className="font-display text-[24px] font-black text-ink mb-8 flex items-center gap-4">
                  <span className="w-1.5 h-6 bg-accent2 rounded-full"></span>
                  Professional Expertise
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {thekedar.services.map(svc => (
                    <div key={svc.id} className="px-5 py-4 rounded-2xl bg-bg border border-rule flex items-center justify-between group hover:border-accent2 hover:bg-ap transition-all">
                      <span className="text-[15px] font-bold text-ink uppercase tracking-tight">{svc.name}</span>
                      <div className="text-right">
                         <p className="text-[14px] font-black text-accent2">₹{svc.custom_rate}</p>
                         <p className="text-[9px] font-bold text-muted uppercase tracking-widest">per hour</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS */}
            <div className="bg-white rounded-[32px] border border-rule p-8 lg:p-10 mb-8 shadow-premium overflow-hidden">
              <h2 className="font-display text-[24px] font-black text-ink mb-8 flex items-center gap-4">
                <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                Consumer Feedback
              </h2>
              
              {thekedar.reviews?.length === 0 ? (
                <div className="py-12 text-center bg-bg rounded-2xl border border-dashed border-rule">
                   <p className="text-muted font-bold uppercase tracking-widest text-[11px]">No consumer reviews yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {thekedar.reviews?.slice(0, 5).map(review => (
                    <div key={review.id} className="p-6 rounded-2xl bg-bg border border-rule/50 hover:border-accent2/20 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white border border-rule flex items-center justify-center text-[12px] font-black text-accent shadow-inner-soft">
                             {review.consumer_name?.charAt(0)}
                           </div>
                           <span className="text-ink font-bold text-[14px] tracking-tight">{review.consumer_name?.split(' ')[0]}</span>
                        </div>
                        <div className="flex text-accent2">
                           {[...Array(5)].map((_, i) => (
                             <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'opacity-20'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                           ))}
                        </div>
                      </div>
                      <p className="text-mid font-medium text-[14px] leading-relaxed mb-4 italic">&quot;{review.comment}&quot;</p>
                      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{formatDate(review.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {thekedar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-rule py-6 px-6 z-[400] shadow-premium-hover">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-muted text-[11px] font-black uppercase tracking-[0.2em] mb-1">Standard Engagement Rate</p>
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                 <span className="text-ink font-display text-[32px] font-black leading-none">₹{thekedar.services?.[0]?.custom_rate || thekedar.min_rate || 0}</span>
                 <span className="text-mid font-bold text-[14px]">/hr per worker</span>
              </div>
            </div>
            <button
              onClick={handleBook}
              className="w-full sm:w-auto px-12 py-5 bg-accent text-white font-display text-[18px] font-black tracking-tight rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Book Consultation
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
