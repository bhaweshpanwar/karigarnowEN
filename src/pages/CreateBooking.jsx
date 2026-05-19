import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Map, { Marker, NavigationControl, AttributionControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

const PLATFORM_FEE_RATE = 0.05;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function CreateBooking() {
  const { thekedarId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thekedar, setThekedar] = useState(null);
  const [loadingThekedar, setLoadingThekedar] = useState(true);
  const [thekedarError, setThekedarError] = useState('');

  const [form, setForm] = useState({
    service_id: '',
    workers_needed: 1,
    scheduled_date: '',
    scheduled_time: '',
    job_description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressSelectionMode, setAddressSelectionMode] = useState('saved'); // 'saved' or 'map'
  const [mapMarkerAddress, setMapMarkerAddress] = useState(null);
  const [mapAddressDetails, setMapAddressDetails] = useState({
    address_line1: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
  });
  const [isMapLocationSelected, setIsMapLocationSelected] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const [mapState, setMapState] = useState({
    longitude: 75.8577, // Indore, MP Longitude
    latitude: 22.7196,  // Indore, MP Latitude
    zoom: 12,
  });

  useEffect(() => {
    setLoadingThekedar(true);
    api.get(`/thekedars/${thekedarId}`)
      .then(res => { if (res.data.success) setThekedar(res.data.data); })
      .catch(() => setThekedarError('Could not load thekedar info.'))
      .finally(() => setLoadingThekedar(false));
  }, [thekedarId]);

  useEffect(() => {
    api.get('/addresses')
      .then(res => {
        if (res.data.success) {
          setAddresses(res.data.data);
          const primary = res.data.data.find(a => a.is_primary);
          if (primary) setSelectedAddressId(primary.id);
          else if (res.data.data.length > 0) setSelectedAddressId(res.data.data[0].id);
        }
      });
  }, []);

  const reverseGeocode = async (lng, lat) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const address = feature.place_name;
        
        // Extract structured components for address creation
        const city = feature.context?.find(c => c.id.startsWith('place'))?.text || 'Indore';
        const state = feature.context?.find(c => c.id.startsWith('region'))?.text || 'Madhya Pradesh';
        const postal = feature.context?.find(c => c.id.startsWith('postcode'))?.text || '452001';
        const country = feature.context?.find(c => c.id.startsWith('country'))?.text || 'India';

        setMapAddressDetails({
          address_line1: address,
          city: city,
          state: state,
          country: country,
          postal_code: postal,
        });

        setMapMarkerAddress(address);
        setIsMapLocationSelected(true);
        setSelectedAddressId('');
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  const handleMapLoad = (e) => {
    e.target.resize();
  };

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    setMapState(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 14 }));
    reverseGeocode(lng, lat);
  };

  const handleLocationSearch = async () => {
    if (!locationSearch) return;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationSearch)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setMapState({ longitude: lng, latitude: lat, zoom: 14 });
        reverseGeocode(lng, lat);
        setSelectedAddressId('');
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const teamSize = thekedar?.team_size || thekedar?.workers?.length || 1;
  const selectedService = thekedar?.services?.find(s => s.id === form.service_id);
  const rate = selectedService?.custom_rate || thekedar?.services?.[0]?.custom_rate || 0;
  const estimatedHours = 1;
  const subtotal = rate * form.workers_needed * estimatedHours;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const total = subtotal + platformFee;

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
    setError('');
  };

  const validate = () => {
    if (!form.service_id) return 'Please select a service';
    if (!form.workers_needed || form.workers_needed < 1) return 'Select at least 1 worker';
    if (!form.scheduled_date) return 'Please select a date';
    if (!form.scheduled_time) return 'Please select a time';

    // Prevent past bookings
    const now = new Date();
    const selectedDate = new Date(`${form.scheduled_date}T${form.scheduled_time}:00`);
    if (selectedDate < now) {
      return 'Selected time has already passed. Please choose a future time.';
    }

    if (!selectedAddressId && !isMapLocationSelected) return 'Please select an address or pin a location on the map';
    if (isMapLocationSelected && !mapMarkerAddress) return 'Please select a point on the map first';
    
    if (!form.job_description || form.job_description.trim().length < 20) return 'Job description must be at least 20 characters';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError('');
    try {
      let addressId = selectedAddressId;

      // If map location is selected, create the address entry first
      if (isMapLocationSelected && !addressId) {
        try {
          const addrRes = await api.post('/addresses', {
            ...mapAddressDetails,
            is_primary: false
          });
          if (addrRes.data.success) {
            addressId = addrRes.data.data.id;
          } else {
            throw new Error('Failed to register the new map location.');
          }
        } catch (addrErr) {
          throw new Error('Location Save Error: ' + (addrErr.response?.data?.message || 'Could not save map location as a valid address.'));
        }
      }

      if (!addressId) {
        throw new Error('Address identification failed. Please select an address again.');
      }

      const scheduledAt = `${form.scheduled_date}T${form.scheduled_time}:00`;
      const payload = {
        thekedarId: thekedarId,
        serviceId: form.service_id,
        workersNeeded: form.workers_needed,
        jobDescription: form.job_description,
        scheduledAt: scheduledAt,
        addressId: addressId,
      };
      
      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        navigate(`/bookings/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (loadingThekedar) {
    return (
      <div className="min-h-screen bg-bg pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent2 border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] font-bold text-muted uppercase tracking-[0.2em]">Securing Connection...</p>
        </div>
      </div>
    );
  }

  if (thekedarError) {
    return (
      <div className="min-h-screen bg-bg pt-24 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-rule shadow-premium text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-rbg text-red rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-ink font-bold text-lg mb-2">{thekedarError}</p>
          <button onClick={() => window.location.reload()} className="text-accent2 font-bold hover:underline uppercase text-[12px] tracking-widest">Retry Request</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-24 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* ── HEADER ── */}
        <div className="mb-10">
          <nav className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            <Link to={`/thekedars/${thekedarId}`} className="hover:text-accent transition-colors truncate max-w-[150px]">{thekedar?.name}</Link>
            <span className="opacity-30">/</span>
            <span className="text-ink">Booking</span>
          </nav>
          <h1 className="font-display text-[40px] font-black text-ink tracking-tight leading-none mb-4">Request Service</h1>
          <p className="text-mid font-medium">Finalize your service request details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6">
            {/* Thekedar Summary */}
            {thekedar && (
              <div className="p-6 bg-white rounded-2xl border border-rule shadow-premium flex items-center gap-5 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center font-display text-[24px] font-black shadow-inner">
                  {thekedar.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-ink font-bold text-lg leading-tight mb-1">{thekedar.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-muted text-[12px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      {thekedar.location}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-rule"></span>
                    <p className="text-accent2 text-[12px] font-bold uppercase tracking-widest">{thekedar.rating_average?.toFixed(1)}★ Rating</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div className="p-8 bg-white rounded-2xl border border-rule shadow-premium space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted block px-1">Service Required</label>
                <select name="service_id" value={form.service_id} onChange={handleChange} required
                  className="w-full px-4 py-4 rounded-xl bg-bg border border-rule text-ink text-[15px] font-bold outline-none focus:border-accent transition-all appearance-none cursor-pointer">
                  <option value="">Select from catalog</option>
                  {thekedar?.services?.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.name} — ₹{svc.custom_rate}/hr</option>
                  ))}
                </select>
              </div>

              {/* Workers & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white rounded-2xl border border-rule shadow-premium space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted block px-1">Labour Force</label>
                  <div className="flex items-center gap-6">
                    <button type="button" onClick={() => handleChange({ target: { name: 'workers_needed', value: Math.max(1, form.workers_needed - 1), type: 'number' } })}
                      className="w-12 h-12 rounded-xl bg-bg2 text-ink text-xl font-black hover:bg-bg3 transition-all">−</button>
                    <span className="text-ink font-display text-3xl font-black tabular-nums">{form.workers_needed}</span>
                    <button type="button" onClick={() => handleChange({ target: { name: 'workers_needed', value: Math.min(teamSize, form.workers_needed + 1), type: 'number' } })}
                      className="w-12 h-12 rounded-xl bg-bg2 text-ink text-xl font-black hover:bg-bg3 transition-all">+</button>
                  </div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest pt-2">Max team size: {teamSize}</p>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-rule shadow-premium space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted block px-1">Date</label>
                    <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={handleChange} min={minDate} required
                      className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[14px] font-bold outline-none focus:border-accent transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted block px-1">Start Time</label>
                    <select name="scheduled_time" value={form.scheduled_time} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[14px] font-bold outline-none focus:border-accent transition-all appearance-none cursor-pointer">
                      <option value="">Select</option>
                      {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Selection */}
              <div className="p-8 bg-white rounded-2xl border border-rule shadow-premium space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Service Location</label>
                  <div className="flex bg-bg2 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => { setAddressSelectionMode('saved'); setIsMapLocationSelected(false); }}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${addressSelectionMode === 'saved' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-mid'}`}
                    >
                      Saved
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddressSelectionMode('map'); setSelectedAddressId(''); }}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${addressSelectionMode === 'map' ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-mid'}`}
                    >
                      Map
                    </button>
                  </div>
                </div>

                {addressSelectionMode === 'saved' ? (
                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-rbg border border-red/10 text-center">
                        <p className="text-red font-bold text-[13px] mb-4">No addresses saved yet.</p>
                        <Link to="/settings" className="px-5 py-2 bg-red text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-red/90 transition-all">Add Address</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setIsMapLocationSelected(false);
                              setMapMarkerAddress(null);
                            }}
                            className={`p-4 rounded-xl text-left transition-all border-2 ${
                              selectedAddressId === addr.id
                                ? 'border-accent bg-ap shadow-inner'
                                : 'border-rule/50 bg-bg hover:border-muted hover:bg-bg3/20'
                            }`}
                          >
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedAddressId === addr.id ? 'text-accent' : 'text-muted'}`}>
                              {addr.is_primary ? 'Primary' : 'Address'}
                            </p>
                            <p className="text-[13px] font-bold text-ink truncate">{addr.city}</p>
                            <p className="text-[11px] font-medium text-mid truncate opacity-70">{addr.address_line1}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search specific location..."
                        value={locationSearch}
                        onChange={e => setLocationSearch(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleLocationSearch()}
                        className="w-full pl-4 pr-24 py-3.5 rounded-xl bg-bg border border-rule text-ink text-[14px] font-bold outline-none focus:border-accent transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleLocationSearch}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-ink text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-accent transition-all"
                      >
                        Search
                      </button>
                    </div>

                    {!MAPBOX_TOKEN || MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN' ? (
                      <div className="w-full h-64 rounded-2xl border border-dashed border-rule bg-bg2/50 flex flex-col items-center justify-center text-center p-8">
                        <svg className="w-10 h-10 text-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        <p className="text-[12px] font-medium text-muted">Geographic positioning unavailable. Please use saved addresses.</p>
                      </div>
                    ) : (
                      <div className="w-full h-64 rounded-2xl border border-rule overflow-hidden shadow-inner-soft relative">
                        <Map
                          initialViewState={mapState}
                          mapboxAccessToken={MAPBOX_TOKEN}
                          onLoad={handleMapLoad}
                          onClick={handleMapClick}
                          mapStyle="mapbox://styles/mapbox/streets-v11"
                          style={{ width: '100%', height: '100%' }}
                        >
                          <NavigationControl position="top-right" />
                          <AttributionControl position="bottom-left" />
                          {isMapLocationSelected && (
                            <Marker longitude={mapState.longitude} latitude={mapState.latitude} color="#10b981" />
                          )}
                        </Map>
                      </div>
                    )}
                  </div>
                )}

                {(selectedAddressId || isMapLocationSelected) && (
                  <div className={`p-5 rounded-2xl flex items-start gap-4 ${isMapLocationSelected ? 'bg-bluebg/40 border border-blue/10' : 'bg-ap/40 border border-accent/10'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isMapLocationSelected ? 'bg-blue text-white' : 'bg-accent text-white'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-ink mb-1">
                        {isMapLocationSelected ? 'Map coordinate confirmed' : 'Verified Address'}
                      </p>
                      <p className="text-[13px] font-medium text-mid leading-snug">
                        {(() => {
                          if (isMapLocationSelected) return mapMarkerAddress;
                          const addr = addresses.find(a => a.id === selectedAddressId);
                          if (!addr) return '';
                          return [addr.address_line1, addr.address_line2, addr.city].filter(Boolean).join(', ');
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="p-8 bg-white rounded-2xl border border-rule shadow-premium space-y-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted block px-1">Job Specifications</label>
                <textarea name="job_description" value={form.job_description} onChange={handleChange} required minLength={20} rows={4}
                  placeholder="Describe the work needed in detail (e.g. materials available, specific repair needed)..."
                  className="w-full px-4 py-4 rounded-xl bg-bg border border-rule text-ink text-[15px] font-medium placeholder-muted outline-none focus:border-accent transition-all resize-none shadow-inner-soft" />
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Minimum 20 characters required.</p>
              </div>
            </form>
          </div>

          {/* ── PRICE ESTIMATE SIDEBAR ── */}
          <aside className="sticky top-24 space-y-6 animate-in slide-up" style={{ animationDelay: '0.1s' }}>
            {selectedService ? (
              <div className="bg-white rounded-3xl border border-rule shadow-premium overflow-hidden">
                <div className="p-8 bg-ink text-white">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Estimate Overview</h3>
                  <p className="text-[32px] font-display font-black tracking-tight tabular-nums">{formatCurrency(total)}</p>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-center text-[13px] font-bold text-mid">
                    <span className="opacity-70 font-medium">Rate Details</span>
                    <span className="text-ink tabular-nums">{formatCurrency(rate)}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-bold text-mid">
                    <span className="opacity-70 font-medium">Total Force</span>
                    <span className="text-ink tabular-nums">× {form.workers_needed}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-bold text-mid">
                    <span className="opacity-70 font-medium">Initial Duration</span>
                    <span className="text-ink tabular-nums">{estimatedHours} hr</span>
                  </div>
                  
                  <div className="pt-4 border-t border-rule space-y-4">
                    <div className="flex justify-between items-center text-[13px] font-bold text-mid">
                      <span className="opacity-70 font-medium">Subtotal</span>
                      <span className="text-ink tabular-nums">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] font-bold text-mid">
                      <span className="opacity-70 font-medium">Platform Fee (5%)</span>
                      <span className="text-ink tabular-nums">{formatCurrency(platformFee)}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-rule flex justify-between items-center">
                    <span className="text-[14px] font-black uppercase tracking-widest text-ink">Grand Total</span>
                    <span className="text-[20px] font-black text-accent2 tabular-nums">{formatCurrency(total)}</span>
                  </div>
                  
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-relaxed pt-4">
                    * This is a tentative estimate. Final payout depends on actual logged hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-bg2/50 rounded-3xl border border-dashed border-rule p-12 text-center">
                <p className="text-[12px] font-bold text-muted uppercase tracking-widest">Select a service to see estimate</p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rbg border border-red/20 text-red text-[12px] font-bold flex items-center gap-3 animate-in fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedService}
              className="w-full py-5 bg-accent text-white font-display font-black text-[16px] uppercase tracking-widest rounded-2xl shadow-premium hover:shadow-premium-hover hover:bg-ink active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Confirm Booking
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </span>
              )}
            </button>
            
            <p className="text-center text-[11px] text-muted font-medium px-4">
              Funds will be held in escrow and only released to the contractor after your OTP verification.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
