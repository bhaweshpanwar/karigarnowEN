import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Services', to: '/services' },
  ];

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <nav className="sticky top-0 z-[300] w-full border-b border-rule/60 bg-bg/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left side: Logo & Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-display font-black text-lg group-hover:scale-110 transition-transform shadow-premium">
              K
            </div>
            <span className="font-display text-[18px] font-bold tracking-tight text-ink">
              Karigar<span className="text-accent2">Now</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${
                  location.pathname === link.to 
                    ? 'bg-ink text-white shadow-sm' 
                    : 'text-mid hover:text-ink hover:bg-bg2'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'consumer' && (
              <Link
                to="/bookings"
                className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${
                  location.pathname === '/bookings' 
                    ? 'bg-ink text-white shadow-sm' 
                    : 'text-mid hover:text-ink hover:bg-bg2'
                }`}
              >
                My Bookings
              </Link>
            )}
            {user?.role === 'thekedar' && (
              <Link
                to="/thekedar/dashboard"
                className={`px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${
                  location.pathname.startsWith('/thekedar') 
                    ? 'bg-ink text-white shadow-sm' 
                    : 'text-mid hover:text-ink hover:bg-bg2'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Right side: Auth/User */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-[13px] font-semibold text-mid hover:text-ink transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-[13px] font-bold bg-accent text-white rounded-md hover:bg-ink shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border border-rule bg-white hover:border-muted transition-all shadow-sm"
              >
                <span className="text-[12px] font-bold text-ink mr-1">{user.name.split(' ')[0]}</span>
                <div className="w-7 h-7 rounded-full bg-accent2 text-white font-display text-[12px] flex items-center justify-center shadow-inner">
                  {avatarLetter}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-rule rounded-xl shadow-premium-hover animate-scale-in origin-top-right overflow-hidden">
                  <div className="px-4 py-3 bg-bg2/50 border-b border-rule">
                    <p className="text-[13px] font-bold text-ink leading-tight">{user.name}</p>
                    <p className="text-[11px] text-muted mt-0.5 truncate">{user.email}</p>
                  </div>

                  <div className="p-1.5">
                    {(user.role === 'consumer' 
                      ? [{ label: 'My Bookings', to: '/bookings' }, { label: 'Settings', to: '/settings' }] 
                      : [{ label: 'Dashboard', to: '/thekedar/dashboard' }, { label: 'My Workers', to: '/thekedar/workers' }, { label: 'Earnings', to: '/thekedar/earnings' }, { label: 'Settings', to: '/settings' }]
                    ).map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-3 py-2 text-[13px] font-medium text-mid hover:text-ink hover:bg-bg2 rounded-md transition-all"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="p-1.5 border-t border-rule">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-[13px] font-medium text-red hover:bg-rbg rounded-md transition-all"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
