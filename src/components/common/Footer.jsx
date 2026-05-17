import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink pt-20 pb-12 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-16 mb-20">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-accent2 rounded-xl flex items-center justify-center text-white font-display font-black text-xl">K</div>
              <p className="font-display text-[24px] font-bold text-white tracking-tight">
                Karigar<span className="text-accent2">Now</span>
              </p>
            </div>
            <p className="text-[15px] text-white/40 max-w-sm leading-relaxed mb-8">
              Revolutionizing the way India hires skilled labor. Reliable, verified, and expert contractors at your fingertips.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/bhaweshpanwar/karigarnoww" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
                title="GitHub Repository"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-all">
                  <span className="text-[10px]">●</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-widest mb-8">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/info#browse-services" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Browse Services</Link></li>
              <li><Link to="/info#how-it-works" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">How it works</Link></li>
              <li><Link to="/info#verify-worker" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Verify Worker</Link></li>
              <li><Link to="/info#escrow-payments" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Escrow Payments</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[13px] font-bold uppercase tracking-widest mb-8">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/info#help-center" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Help Center</Link></li>
              <li><Link to="/info#terms-of-service" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Terms of Service</Link></li>
              <li><Link to="/info#privacy-policy" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link to="/info#contact-us" className="text-white/40 hover:text-white text-[14px] transition-colors font-medium">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/20 font-medium">
            &copy; {new Date().getFullYear()} KarigarNow. Crafting excellence across India.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[12px] text-white/20 font-medium cursor-pointer hover:text-white/40">Indore</span>
            <span className="text-[12px] text-white/20 font-medium cursor-pointer hover:text-white/40">Bhopal</span>
            <span className="text-[12px] text-white/20 font-medium cursor-pointer hover:text-white/40">Ujjain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
