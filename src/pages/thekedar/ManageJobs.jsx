import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ToastContext from '../../context/ToastContext';
import { formatCurrency, formatDate, maskName } from '../../utils/formatters';

const TABS = ['Incoming', 'Active', 'Completed', 'Cancelled'];

function StatusBadge({ status }) {
  const styles = {
    pending:     { bg: 'bg-goldbg', text: 'text-gold', label: 'Pending' },
    accepted:    { bg: 'bg-bluebg', text: 'text-blue', label: 'Accepted' },
    dispatched:  { bg: 'bg-ap', text: 'text-accent', label: 'Dispatched' },
    in_progress: { bg: 'bg-ap', text: 'text-accent2', label: 'In Progress' },
    completed:   { bg: 'bg-gbg', text: 'text-green', label: 'Completed' },
    cancelled:   { bg: 'bg-rbg', text: 'text-red', label: 'Cancelled' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function BookingCard({ booking, onAccept, onDecline, showDispatch, onDispatch }) {
  const [accepted, setAccepted] = useState(false);
  const { showToast } = useContext(ToastContext);

  const handleAccept = async () => {
    try {
      const res = await api.put(`/bookings/${booking.id}/accept`);
      if (res.data.success) {
        setAccepted(true);
        showToast('Booking accepted!', 'success');
        if (onAccept) onAccept(booking.id, res.data.data);
      }
    } catch {
      showToast('Failed to accept', 'error');
    }
  };

  const handleDecline = async () => {
    try {
      const res = await api.put(`/bookings/${booking.id}/reject`);
      if (res.data.success) {
        showToast('Booking declined', 'info');
        if (onDecline) onDecline(booking.id);
      }
    } catch {
      showToast('Failed to decline', 'error');
    }
  };

  const serviceName = booking.service?.name || 'Service';

  return (
    <div className="bg-white border border-rule rounded-2xl p-6 shadow-premium group hover:border-accent2/30 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[18px] font-bold text-ink leading-tight mb-1">{maskName(booking.consumer_name)}</p>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-accent2"></span>
               <p className="text-[12px] font-bold text-muted uppercase tracking-widest">{serviceName}</p>
            </div>
          </div>
          <StatusBadge status={booking.booking_status} />
        </div>

        <div className="space-y-3 mb-6">
          {booking.address && (
            <div className="flex items-start gap-2 text-mid">
               <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
               <p className="text-[13px] font-medium leading-relaxed">
                 {booking.address.address_line1}, {booking.address.city}
               </p>
            </div>
          )}

          {booking.job_description && (
            <p className="text-[13px] text-muted italic line-clamp-2 bg-bg p-3 rounded-xl border border-rule/50">
              &quot;{booking.job_description}&quot;
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="px-3 py-1.5 rounded-lg bg-bg border border-rule flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Workers:</span>
            <span className="text-[13px] font-black text-ink">{booking.workers_needed}</span>
          </div>
          {booking.scheduled_at && (
            <div className="px-3 py-1.5 rounded-lg bg-bg border border-rule flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Date:</span>
              <span className="text-[13px] font-black text-ink">{formatDate(booking.scheduled_at)}</span>
            </div>
          )}
          {booking.total_amount && (
            <div className="px-3 py-1.5 rounded-lg bg-ap border border-accent2/20 flex items-center gap-2">
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Payout:</span>
              <span className="text-[13px] font-black text-accent2">{formatCurrency(booking.total_amount)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        {showDispatch && booking.booking_status === 'accepted' && (
          <button
            onClick={() => onDispatch(booking)}
            className="w-full py-3.5 bg-accent text-white text-[14px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Dispatch Workers
          </button>
        )}

        {booking.booking_status === 'pending' && !accepted && (
          <div className="flex gap-3">
            <button 
              onClick={handleAccept} 
              className="flex-1 py-3.5 bg-green text-white text-[14px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all"
            >
              Accept Job
            </button>
            <button 
              onClick={handleDecline} 
              className="flex-1 py-3.5 bg-white border border-red text-red text-[14px] font-bold rounded-xl hover:bg-rbg transition-all"
            >
              Decline
            </button>
          </div>
        )}

        {accepted && (
          <div className="bg-gbg border border-green/20 rounded-xl p-4 text-center animate-in scale-in">
            <p className="text-[13px] font-black text-green uppercase tracking-widest mb-3">Booking Accepted</p>
            {booking.otp && (
              <div className="flex justify-center gap-2">
                {booking.otp.split('').map((d, i) => (
                  <div key={i} className="w-10 h-12 rounded-lg bg-white border border-green/20 flex items-center justify-center text-xl font-black text-green shadow-inner-soft">{d}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {booking.booking_status === 'dispatched' && booking.assigned_workers && (
          <div className="pt-4 border-t border-rule mt-2">
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Assigned Team:</p>
            <div className="flex flex-wrap gap-2">
              {booking.assigned_workers.map(w => (
                <div key={w.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ap border border-accent2/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent2"></div>
                  <span className="text-[12px] font-bold text-ink">{w.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {booking.booking_status === 'completed' && (
          <div className="flex justify-between items-center p-4 bg-bg rounded-xl border border-rule">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Net Earnings</span>
              <span className="text-[16px] font-black text-green">
                {formatCurrency(booking.thekedar_payout)}
              </span>
            </div>
            {booking.review && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Rating</span>
                <span className="text-[14px] font-black text-gold">★ {booking.review.rating}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DispatchModal({ booking, workers, onClose, onDispatch }) {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useContext(ToastContext);
  const needed = booking?.workers_needed || 1;

  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
    setError('');
  };

  const handleDispatch = async () => {
    if (selected.length !== needed) {
      setError(`Select exactly ${needed} worker${needed > 1 ? 's' : ''} (${selected.length} selected)`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.put(`/bookings/${booking.id}/dispatch`, { workerIds: selected });
      if (res.data.success) {
        showToast('Workers dispatched!', 'success');
        onDispatch(booking.id, res.data.data);
        onClose();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to dispatch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-sm bg-ink/60 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-premium border border-rule animate-in slide-up">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[24px] font-display font-black text-ink tracking-tight leading-none">Dispatch Team</h3>
            <p className="text-muted text-[13px] font-medium mt-2">Select {needed} professional{needed > 1 ? 's' : ''} for this job.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-ink transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-3 mb-8 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
          {workers.length === 0 ? (
            <div className="py-12 text-center bg-bg rounded-2xl border border-dashed border-rule">
               <p className="text-[12px] font-bold text-muted uppercase tracking-widest">No workers available</p>
            </div>
          ) : workers.map(w => (
            <button
              key={w.id}
              onClick={() => w.is_available && handleToggle(w.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${
                selected.includes(w.id)
                  ? 'border-accent2 bg-ap shadow-inner-soft'
                  : w.is_available
                    ? 'border-rule bg-white hover:border-muted hover:bg-bg'
                    : 'border-rule bg-bg opacity-40 cursor-not-allowed'
              }`}
              disabled={!w.is_available}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                selected.includes(w.id) ? 'border-accent2 bg-accent2' : 'border-rule bg-bg'
              }`}>
                {selected.includes(w.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-ink">{w.name}</p>
                <p className="text-[11px] text-muted font-bold uppercase tracking-widest">
                  {Array.isArray(w.skills) ? w.skills.join(' • ') : w.skills}
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${w.is_available ? 'text-green' : 'text-muted'}`}>
                {w.is_available ? 'Available' : 'Busy'}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rbg border border-red/20 text-red text-[12px] font-bold text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest">
               {selected.length} of {needed} selected
            </p>
          </div>
          <button
            onClick={handleDispatch}
            disabled={submitting || selected.length !== needed}
            className="w-full py-4 bg-accent text-white text-[15px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-50"
          >
            {submitting ? 'Dispatching...' : 'Confirm Dispatch'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageJobs() {
  const [activeTab, setActiveTab] = useState('Incoming');
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchBooking, setDispatchBooking] = useState(null);
  const { showToast } = useContext(ToastContext);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/bookings?page=0&size=100'),
      api.get('/workers'),
    ]).then(([bRes, wRes]) => {
      if (bRes.data.success) setBookings(bRes.data.data.content || []);
      if (wRes.data.success) setWorkers(wRes.data.data || []);
    }).catch(() => showToast('Failed to load jobs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Incoming') return b.booking_status === 'pending';
    if (activeTab === 'Active') return ['accepted', 'dispatched', 'in_progress'].includes(b.booking_status);
    if (activeTab === 'Completed') return b.booking_status === 'completed';
    if (activeTab === 'Cancelled') return b.booking_status === 'cancelled';
    return true;
  });

  const handleAccept = (id, data) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const handleDecline = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleDispatch = (id, data) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    setDispatchBooking(null);
  };

  return (
    <div className="pb-20 md:pb-12 animate-in slide-up">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ap border border-accent2/20 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent2"></span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-accent">Operations Dashboard</span>
        </div>
        <h1 className="font-display text-[48px] font-black text-ink tracking-tight leading-none">Manage Jobs</h1>
        <p className="text-mid font-medium mt-2">Track, accept and fulfill service requests in real-time.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-10 p-1.5 rounded-2xl bg-white border border-rule shadow-premium max-w-2xl">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-[13px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-accent text-white shadow-md' 
                : 'text-muted hover:text-ink hover:bg-bg'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-72 bg-bg3 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl py-24 text-center bg-white border border-dashed border-rule shadow-inner-soft">
          <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <p className="text-mid font-bold uppercase tracking-widest text-[13px]">No {activeTab.toLowerCase()} jobs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onAccept={handleAccept}
              onDecline={handleDecline}
              showDispatch={activeTab === 'Active'}
              onDispatch={(b) => setDispatchBooking(b)}
            />
          ))}
        </div>
      )}

      {dispatchBooking && (
        <DispatchModal
          booking={dispatchBooking}
          workers={workers}
          onClose={() => setDispatchBooking(null)}
          onDispatch={handleDispatch}
        />
      )}
    </div>
  );
}
