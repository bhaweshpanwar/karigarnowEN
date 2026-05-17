import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_TABS = ['All', 'pending', 'accepted', 'dispatched', 'in_progress', 'completed', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-goldbg text-gold border-gold/10',
  accepted: 'bg-bluebg text-blue border-blue/10',
  dispatched: 'bg-gbg text-green border-green/10',
  in_progress: 'bg-ap text-accent border-accent/10',
  completed: 'bg-gbg text-green border-green/10',
  cancelled: 'bg-rbg text-red border-red/10',
};

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  dispatched: 'Dispatched',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function BookingSkeleton() {
  return (
    <div className="animate-pulse p-6 rounded-2xl border border-rule/30 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-bg3 rounded" />
          <div className="h-3 w-24 bg-bg3 rounded" />
        </div>
        <div className="h-6 w-20 bg-bg3 rounded-full" />
      </div>
      <div className="h-3 w-full bg-bg3 rounded mb-4" />
      <div className="h-10 w-full bg-bg3 rounded-xl" />
    </div>
  );
}

export default function BookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBookings = (tabPage = 0) => {
    if (tabPage === 0) setLoading(true);
    else setLoadingMore(true);
    setError('');

    const params = new URLSearchParams({ page: tabPage, size: 10 });
    if (activeTab !== 'All') params.set('status', activeTab);

    api.get(`/bookings?${params}`)
      .then(res => {
        if (res.data.success) {
          const content = res.data.data.content;
          if (tabPage === 0) setBookings(content);
          else setBookings(prev => [...prev, ...content]);
          setHasMore(res.data.data.currentPage < res.data.data.totalPages - 1);
          setPage(tabPage);
        }
      })
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => { setLoading(false); setLoadingMore(false); });
  };

  useEffect(() => { setPage(0); fetchBookings(0); }, [activeTab]);

  const loadMore = () => fetchBookings(page + 1);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-display text-[40px] font-black text-ink tracking-tight leading-none mb-4">My Bookings</h1>
          <p className="text-mid font-medium">Manage and track your active service requests.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-ink text-white shadow-premium'
                  : 'bg-white border border-rule text-mid hover:text-ink hover:bg-bg2'
              }`}
            >
              {tab === 'All' ? 'All Requests' : STATUS_LABELS[tab] || tab}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-10 p-6 rounded-2xl bg-rbg border border-red/10 text-center animate-in fade-in">
            <p className="text-red font-bold text-[14px] mb-4">{error}</p>
            <button onClick={() => fetchBookings(0)} className="px-6 py-2 bg-red text-white font-bold rounded-lg hover:bg-red/90 transition-all shadow-sm">
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <BookingSkeleton key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-3xl border border-rule p-20 text-center animate-in slide-up shadow-premium">
            <div className="w-20 h-20 bg-bg2 rounded-full flex items-center justify-center mx-auto mb-8 text-muted/30">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-ink font-display text-2xl font-bold mb-3">No bookings found</h3>
            <p className="text-mid font-medium mb-8 max-w-sm mx-auto leading-relaxed">It looks like you haven&apos;t scheduled any services yet. Our thekedars are ready to help!</p>
            <Link to="/services"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-accent text-white font-display font-black text-[14px] uppercase tracking-widest hover:bg-ink transition-all shadow-premium hover:shadow-premium-hover">
              Browse Services
            </Link>
          </div>
        )}

        {/* List Grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((b, i) => (
                <div key={b.id} className="group bg-white p-6 rounded-2xl border border-rule hover:border-accent2 hover:shadow-premium-hover transition-all duration-300 relative overflow-hidden animate-in slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display text-[18px] font-bold text-ink leading-tight mb-1 group-hover:text-accent2 transition-colors">{b.service_name}</h3>
                      <p className="text-[12px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                         {b.thekedar_name}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[b.booking_status] || ''}`}>
                      {STATUS_LABELS[b.booking_status] || b.booking_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-bg rounded-xl border border-rule/50">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Scheduled</p>
                       <p className="text-[12px] font-bold text-ink truncate">{b.scheduled_at ? formatDate(b.scheduled_at) : 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-bg rounded-xl border border-rule/50">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Total Due</p>
                       <p className="text-[12px] font-black text-accent tabular-nums truncate">{formatCurrency(b.total_amount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <p className="text-[11px] font-bold text-mid uppercase tracking-widest">
                       {b.workers_needed || 1} Worker{(b.workers_needed || 1) > 1 ? 's' : ''} assigned
                     </p>
                     <button
                       onClick={() => navigate(`/bookings/${b.id}`)}
                       className="px-5 py-2.5 rounded-xl bg-bg2 text-ink text-[12px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all shadow-inner-soft"
                     >
                       Track Order
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
                  {loadingMore ? 'Syncing history...' : 'Load previous bookings'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
