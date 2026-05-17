import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', mobile: '', photo: '' });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    is_primary: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        photo: user.photo || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = () => {
    setAddressLoading(true);
    api.get('/addresses')
      .then(res => {
        if (res.data.success) setAddresses(res.data.data);
      })
      .catch(() => showToast('Failed to load addresses', 'error'))
      .finally(() => setAddressLoading(false));
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      const res = await api.put('/users/me', profile);
      if (res.data.success) {
        login(res.data.data);
        showToast('Profile updated successfully', 'success');
        setProfileEditing(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Both fields are required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    try {
      const res = await api.put('/users/me/password', passwordForm);
      if (res.data.success) {
        showToast('Password changed successfully', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '' });
        setPasswordVisible(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      is_primary: false,
    });
    setEditingAddressId(null);
    setAddressFormVisible(false);
  };

  const handleAddressEdit = (address) => {
    setAddressForm({
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'India',
      postal_code: address.postal_code || '',
      is_primary: address.is_primary || false,
    });
    setEditingAddressId(address.id);
    setAddressFormVisible(true);
  };

  const handleAddressSave = async () => {
    if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setAddressSaving(true);
    try {
      if (editingAddressId) {
        const res = await api.put(`/addresses/${editingAddressId}`, addressForm);
        if (res.data.success) {
          setAddresses(prev => prev.map(a => a.id === editingAddressId ? res.data.data : a));
          showToast('Address updated', 'success');
        }
      } else {
        const res = await api.post('/addresses', addressForm);
        if (res.data.success) {
          setAddresses(prev => [...prev, res.data.data]);
          showToast('Address added', 'success');
        }
      }
      resetAddressForm();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Address deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete address', 'error');
    }
  };

  const handleSetPrimary = async (id) => {
    const addr = addresses.find(a => a.id === id);
    if (!addr) return;
    try {
      await api.put(`/addresses/${id}`, { ...addr, is_primary: true });
      setAddresses(prev => prev.map(a => ({ ...a, is_primary: a.id === id })));
      showToast('Primary address updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update primary', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16 px-6 lg:px-12">
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-up">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ap border border-accent2/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-accent2"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-accent">Account Preferences</span>
          </div>
          <h1 className="font-display text-[48px] font-black text-ink tracking-tight leading-none">Settings</h1>
          <p className="text-mid font-medium mt-2">Manage your profile, security and service addresses.</p>
        </div>

        {/* Profile Section */}
        <div className="p-8 rounded-2xl border border-rule bg-white shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-display font-bold text-ink">Personal Profile</h2>
              <p className="text-[13px] text-muted font-medium">Your public and account information.</p>
            </div>
            {!profileEditing && (
              <button
                onClick={() => setProfileEditing(true)}
                className="px-4 py-2 text-[12px] font-bold text-accent2 uppercase tracking-widest hover:bg-ap rounded-lg transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>

          {profileEditing ? (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Mobile Number</label>
                <input
                  type="text"
                  value={profile.mobile}
                  onChange={e => setProfile(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="px-6 py-3 bg-accent text-white text-[14px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-50"
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setProfileEditing(false); setProfile({ name: user.name, email: user.email, mobile: user.mobile, photo: user.photo }); }}
                  className="px-6 py-3 bg-bg border border-rule text-ink text-[14px] font-bold rounded-xl hover:bg-bg2 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { label: 'Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Mobile', value: user?.mobile || 'Not provided' },
                { label: 'Account Type', value: user?.role, capitalize: true },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-4 border-b border-rule/50 last:border-0 last:pb-0">
                  <span className="text-[13px] font-bold text-muted uppercase tracking-wider">{item.label}</span>
                  <span className={`text-[15px] font-semibold text-ink ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="p-8 rounded-2xl border border-rule bg-white shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-display font-bold text-ink">Security</h2>
              <p className="text-[13px] text-muted font-medium">Update your account password.</p>
            </div>
            <button
              onClick={() => { setPasswordVisible(v => !v); setPasswordError(''); }}
              className={`px-4 py-2 text-[12px] font-bold uppercase tracking-widest rounded-lg transition-all ${passwordVisible ? 'text-red bg-rbg' : 'text-accent2 hover:bg-ap'}`}
            >
              {passwordVisible ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {passwordVisible && (
            <div className="space-y-5 animate-in fade-in">
              {passwordError && (
                <div className="p-4 rounded-xl bg-rbg border border-red/20 text-red text-[13px] font-bold flex items-center gap-3">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   {passwordError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={passwordSaving}
                className="w-full py-4 bg-accent text-white text-[14px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-50"
              >
                {passwordSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Address Section */}
        <div className="p-8 rounded-2xl border border-rule bg-white shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-display font-bold text-ink">Saved Addresses</h2>
              <p className="text-[13px] text-muted font-medium">Manage locations for service bookings.</p>
            </div>
            {!addressFormVisible && (
              <button
                onClick={() => { setAddressFormVisible(true); setEditingAddressId(null); resetAddressForm(); }}
                className="px-4 py-2 text-[12px] font-bold text-accent2 uppercase tracking-widest hover:bg-ap rounded-lg transition-all"
              >
                + Add New
              </button>
            )}
          </div>

          {addressLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-accent2 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : addresses.length === 0 && !addressFormVisible ? (
            <div className="py-12 text-center bg-bg rounded-2xl border border-dashed border-rule">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <p className="text-mid font-bold mb-4">No addresses saved yet</p>
              <button onClick={() => setAddressFormVisible(true)} className="text-accent2 font-bold hover:underline uppercase text-[11px] tracking-widest">
                Add your first address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map(addr => (
                <div key={addr.id} className="p-5 rounded-xl border border-rule bg-bg hover:border-accent2/30 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-[15px] font-bold text-ink">{addr.address_line1}</p>
                        {addr.is_primary && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-accent text-white uppercase tracking-widest">Primary</span>
                        )}
                      </div>
                      <p className="text-[13px] text-mid font-medium">{addr.address_line2 ? `${addr.address_line2}, ` : ''}{addr.city}, {addr.state} {addr.postal_code}</p>
                      <p className="text-[12px] text-muted font-bold uppercase tracking-widest mt-1">{addr.country}</p>
                    </div>
                    <div className="flex gap-2">
                      {!addr.is_primary && (
                        <button onClick={() => handleSetPrimary(addr.id)} className="p-2 text-muted hover:text-accent2 transition-colors" title="Set as primary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                      )}
                      <button onClick={() => handleAddressEdit(addr)} className="p-2 text-muted hover:text-ink transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-muted hover:text-red transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {addressFormVisible && (
                <div className="p-6 rounded-2xl border-2 border-accent2 bg-ap/30 space-y-5 animate-in slide-up">
                  <h3 className="text-[18px] font-display font-bold text-ink">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Address Line 1 *</label>
                    <input type="text" value={addressForm.address_line1} onChange={e => setAddressForm(f => ({ ...f, address_line1: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft" placeholder="House/Flat No., Street" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Address Line 2</label>
                    <input type="text" value={addressForm.address_line2} onChange={e => setAddressForm(f => ({ ...f, address_line2: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft" placeholder="Landmark, Area" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">City *</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">State *</label>
                      <input type="text" value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Country</label>
                      <input type="text" value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-widest px-0.5">Postal Code *</label>
                      <input type="text" value={addressForm.postal_code} onChange={e => setAddressForm(f => ({ ...f, postal_code: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-rule text-ink text-[15px] outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-inner-soft" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" id="is_primary" checked={addressForm.is_primary} onChange={e => setAddressForm(f => ({ ...f, is_primary: e.target.checked }))}
                      className="w-5 h-5 accent-accent2 rounded-lg" />
                    <label htmlFor="is_primary" className="text-[14px] font-medium text-ink cursor-pointer">Set as primary address</label>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleAddressSave} disabled={addressSaving}
                      className="px-6 py-3 bg-accent text-white text-[14px] font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-50">
                      {addressSaving ? 'Saving Address...' : 'Save Address'}
                    </button>
                    <button onClick={resetAddressForm}
                      className="px-6 py-3 bg-white border border-rule text-ink text-[14px] font-bold rounded-xl hover:bg-bg transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}