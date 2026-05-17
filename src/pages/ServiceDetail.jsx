import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-accent2 fill-accent2' : 'text-rule stroke-rule'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ThekedarSkeleton() {
  return (
    <div className="animate-pulse p-6 rounded-2xl border border-rule/50 bg-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-bg3" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-bg3 rounded mb-2" />
          <div className="h-3 w-24 bg-bg3 rounded" />
        </div>
      </div>
      <div className="h-4 w-full bg-bg3 rounded mb-2" />
      <div className="h-4 w-2/3 bg-bg3 rounded mb-6" />
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-bg3 rounded-lg" />
        <div className="h-10 flex-1 bg-bg3 rounded-lg" />
      </div>
    </div>
  );
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [thekedars, setThekedars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [city, setCity] = useState('');

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchService = (pageNum = 0) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    setError('');

    const params = new URLSearchParams({ page: pageNum, size: 12 });
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (city) params.set('city', city);

    api.get(`/services/${slug}?${params}`)
      .then(res => {
        if (res.data.success) {
          const data = res.data.data;
          setService(data.service);
          if (pageNum === 0) setThekedars(data.thekedars.content);
          else setThekedars(prev => [...prev, ...data.thekedars.content]);
          setHasMore(data.thekedars.currentPage < data.thekedars.totalPages - 1);
          setPage(pageNum);
        }
      })
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  };

  useEffect(() => { fetchService(0); }, [slug, sort]);

  const handleSearch = e => {
    e.preventDefault();
    fetchService(0);
  };

  const loadMore = () => fetchService(page + 1);

  const handleBook = thekedarId => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'thekedar') { alert('Thekedars cannot book services'); return; }
    navigate(`/book/${thekedarId}`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg pb-24">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-rule pt-12 pb-16 px-6 lg:px-12 mb-12">
        <div className="max-w-[1400px] mx-auto">
          <nav className="mb-8 flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-muted">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
            <span className="opacity-30">/</span>
            <span className="text-ink capitalize">{slug}</span>
          </nav>

          {service && (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in">
              <div className="max-w-2xl">
                <h1 className="font-display text-[48px] md:text-[64px] font-black text-ink tracking-tight leading-[0.95] mb-6">
                  {service.name}
                </h1>
                <p className="text-mid text-[16px] font-medium leading-relaxed opacity-80">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center gap-6 pb-2">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Professionals</p>
                  <p className="font-display text-[24px] font-black text-ink">24 available</p>
                </div>
                <div className="w-px h-12 bg-rule"></div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Avg Rate</p>
                  <p className="font-display text-[24px] font-black text-accent2">₹450/hr</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── FILTERS SIDEBAR ── */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8 bg-white p-8 rounded-2xl border border-rule shadow-premium">
              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Filter Results</label>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search name..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-bg border border-rule text-ink text-[14px] placeholder-muted outline-none focus:border-accent transition-all"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Sort Intelligence</label>
                <div className="space-y-2">
                  {[
                    { v: 'rating', l: 'Top Rated', i: '★' },
                    { v: 'price', l: 'Lowest Price', i: '₹' }
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => { setSort(opt.v); fetchService(0); }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[13px] font-bold ${
                        sort === opt.v 
                          ? 'bg-accent text-white border-accent shadow-md' 
                          : 'bg-white text-mid border-rule hover:border-muted hover:bg-bg'
                      }`}
                    >
                      {opt.l}
                      <span className="opacity-50 font-mono">{opt.i}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Location Coverage</label>
                <div className="relative">
                  <input
                    type="text" value={city} onChange={e => { setCity(e.target.value); fetchService(0); }}
                    placeholder="Enter city..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-bg border border-rule text-ink text-[14px] placeholder-muted outline-none focus:border-accent transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── THEKEDAR GRID ── */}
          <div className="flex-1">
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ThekedarSkeleton key={i} />)}
              </div>
            )}

            {error && (
              <div className="bg-white p-12 rounded-3xl border border-rule text-center animate-in fade-in shadow-premium">
                <p className="text-red font-bold text-[15px] mb-6">{error}</p>
                <button onClick={() => fetchService(0)} className="px-8 py-3 bg-red text-white font-bold rounded-xl hover:bg-red/90 transition-all shadow-md">
                  Retry Loading
                </button>
              </div>
            )}

            {!loading && !error && thekedars.length === 0 && (
              <div className="bg-white p-20 rounded-3xl border border-rule text-center animate-in slide-up">
                <div className="w-16 h-16 bg-bg2 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4"></path></svg>
                </div>
                <p className="text-ink text-lg font-bold">No professionals found</p>
                <p className="text-mid font-medium mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}

            {!loading && !error && thekedars.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {thekedars.map(t => (
                    <div key={t.id} className="group relative bg-white p-8 rounded-2xl border border-rule hover:border-accent2 hover:shadow-premium-hover transition-all duration-300">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center font-display text-[20px] font-black shadow-inner">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-display text-[18px] font-bold text-ink group-hover:text-accent2 transition-colors">{t.name}</h3>
                              {t.is_online && (
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent2 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent2"></span>
                                </span>
                              )}
                            </div>
                            <p className="text-muted text-[12px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                              {t.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-accent font-mono font-bold text-[18px] tabular-nums leading-none">₹{t.custom_rate}</p>
                          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-1.5">per hr / worker</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-6 py-3 border-y border-rule/50">
                        <div className="flex flex-col gap-1">
                          <StarRating rating={t.rating_average} />
                          <p className="text-[10px] font-bold text-ink uppercase tracking-widest">
                            {t.rating_average?.toFixed(1)} <span className="text-muted">Avg Rating</span>
                          </p>
                        </div>
                        <div className="w-px h-8 bg-rule"></div>
                        <div>
                          <p className="font-mono text-[14px] font-bold text-ink tabular-nums leading-none">{t.total_jobs}</p>
                          <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-1">Jobs Done</p>
                        </div>
                      </div>

                      <p className="text-mid text-[13px] font-medium leading-relaxed mb-8 line-clamp-2 opacity-80 italic">
                        &quot;{t.experience || 'Experienced professional with high commitment to quality and deadlines.'}&quot;
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/thekedars/${t.id}`)}
                          className="flex-1 py-3 px-4 rounded-xl border border-rule text-mid font-bold text-[13px] hover:bg-bg transition-all uppercase tracking-widest"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleBook(t.id)}
                          className="flex-[2] py-3 px-4 rounded-xl bg-accent text-white font-bold text-[13px] shadow-sm hover:shadow-md hover:bg-ink active:scale-[0.98] transition-all uppercase tracking-widest"
                        >
                          Book Professional
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-10 py-4 rounded-full border border-rule bg-white text-ink font-bold text-[13px] uppercase tracking-[0.2em] shadow-sm hover:shadow-premium-hover hover:border-muted transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loadingMore ? 'Syncing data...' : 'Load more professionals'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
