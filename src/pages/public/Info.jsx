import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const InfoSection = ({ id, title, children, accent = false }) => (
  <section id={id} className={`py-20 px-6 lg:px-12 border-b border-rule scroll-mt-20 ${accent ? 'bg-bg' : 'bg-white'}`}>
    <div className="max-w-[1400px] mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ap border border-accent2/20 mb-8">
        <span className="w-2 h-2 rounded-full bg-accent2"></span>
        <span className="text-[11px] font-bold tracking-widest uppercase text-accent">KarigarNow Excellence</span>
      </div>
      <h2 className="font-display text-[48px] md:text-[64px] font-black text-ink tracking-tight leading-[0.95] mb-12">
        {title}
      </h2>
      <div className="prose prose-lg max-w-none text-mid font-medium leading-relaxed">
        {children}
      </div>
    </div>
  </section>
);

export default function Info() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="animate-in fade-in">
      {/* ── HERO ── */}
      <header className="bg-ink py-32 px-6 lg:px-12 text-center border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="font-display text-[64px] md:text-[80px] font-black text-white tracking-tight leading-none mb-8">
            Platform <br />
            <span className="text-accent2 italic font-medium">Standards</span>
          </h1>
          <p className="text-white/60 text-[18px] md:text-[20px] font-medium max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our commitment to quality, security, and reliable labor across India.
          </p>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent2/20 rounded-full blur-[120px]"></div>
      </header>

      {/* ── BROWSE SERVICES ── */}
      <InfoSection id="browse-services" title="Browse Services">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="mb-6">
              Our marketplace connects you with a diverse range of skilled professionals. From emergency repairs to large-scale renovations, we cover over 50+ service categories.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-accent2 rounded flex items-center justify-center text-white text-[12px] font-bold">✓</span>
                <span>Verified Electrical & Plumbing Experts</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-accent2 rounded flex items-center justify-center text-white text-[12px] font-bold">✓</span>
                <span>Professional Painting & Civil Work Teams</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-accent2 rounded flex items-center justify-center text-white text-[12px] font-bold">✓</span>
                <span>Cleaning, Pest Control & Maintenance</span>
              </li>
            </ul>
          </div>
          <div className="bg-bg2 rounded-[32px] p-8 border border-rule shadow-inner-soft flex items-center justify-center">
             <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-accent shadow-premium mx-auto mb-6">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                </div>
                <p className="text-ink font-bold">50+ Service Categories</p>
                <p className="text-muted text-sm uppercase tracking-widest font-bold">Hand-picked Excellence</p>
             </div>
          </div>
        </div>
      </InfoSection>

      {/* ── HOW IT WORKS ── */}
      <InfoSection id="how-it-works" title="How it Works" accent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { t: '1. Select & Book', d: 'Choose your required service and pick a verified Thekedar based on ratings and rates.' },
            { t: '2. Escrow Payment', d: 'Your payment is securely held in our escrow system. It is only released when the job is done.' },
            { t: '3. Job Execution', d: 'Workers arrive at your location. You share the arrival OTP and the work begins.' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-rule shadow-premium">
              <h3 className="font-display text-[24px] font-bold text-ink mb-4">{s.t}</h3>
              <p className="text-mid leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </InfoSection>

      {/* ── VERIFY WORKER ── */}
      <InfoSection id="verify-worker" title="Verify Worker">
        <p className="mb-8">
          Safety is our top priority. Every worker deployed through KarigarNow undergoes a strict verification process.
        </p>
        <div className="bg-ap p-8 rounded-[32px] border border-accent2/20">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-accent2 shadow-premium shrink-0">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <h4 className="text-ink font-bold text-[20px] mb-2">Digital ID Card Verification</h4>
              <p className="text-mid font-medium">
                Each worker has a unique Digital ID. Consumers can verify the worker's identity by scanning their QR code or entering their ID in the app before allowing them into their premises.
              </p>
            </div>
          </div>
        </div>
      </InfoSection>

      {/* ── ESCROW PAYMENTS ── */}
      <InfoSection id="escrow-payments" title="Escrow Payments" accent>
        <p className="mb-8">
          KarigarNow eliminates the risk of incomplete work or payment disputes. Our escrow system acts as a neutral third party.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-rule">
            <h4 className="font-bold text-ink mb-4 italic">For Consumers</h4>
            <p>Your money is only paid to the contractor once you confirm that the job has been completed to your satisfaction.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-rule">
            <h4 className="font-bold text-ink mb-4 italic">For Thekedars</h4>
            <p>Know that funds are secured before you start the work. No more chasing payments after the job is finished.</p>
          </div>
        </div>
      </InfoSection>

      {/* ── GITHUB HIGHLIGHT ── */}
      <section className="py-20 px-6 lg:px-12 bg-white border-b border-rule">
        <div className="max-w-[1400px] mx-auto bg-ink rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent2/10 rounded-full blur-[100px] -z-10 group-hover:bg-accent2/20 transition-colors duration-700"></div>
          <h2 className="font-display text-[40px] md:text-[56px] font-black text-white tracking-tight leading-none mb-8">
            Open Source <br />
            <span className="text-accent2 italic font-medium">Commitment</span>
          </h2>
          <p className="text-white/60 text-[18px] font-medium max-w-2xl mx-auto mb-12">
            KarigarNow is built with transparency. Explore our source code, contribute to the ecosystem, and see how we're building the future of labor.
          </p>
          <a 
            href="https://github.com/bhaweshpanwar/karigarnoww" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-10 py-5 bg-white text-ink font-display text-[20px] font-black rounded-2xl shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── SUPPORT SECTIONS ── */}
      <InfoSection id="help-center" title="Help Center">
        <p>Need assistance? Our support team is here to help you with booking, payments, or any platform issues. We aim for a response time of under 2 hours.</p>
        <div className="mt-8 flex flex-wrap gap-4">
           <div className="px-6 py-4 bg-bg rounded-xl border border-rule font-bold text-ink flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
             24/7 Platform Monitoring
           </div>
           <div className="px-6 py-4 bg-bg rounded-xl border border-rule font-bold text-ink">
             Response SLA: 2 Hours
           </div>
        </div>
      </InfoSection>

      <InfoSection id="terms-of-service" title="Terms of Service" accent>
        <p>By using KarigarNow, you agree to our terms regarding fair use, booking protocols, and professional conduct. We maintain a high standard of behavior for both consumers and contractors to ensure a safe marketplace for everyone.</p>
      </InfoSection>

      <InfoSection id="privacy-policy" title="Privacy Policy">
        <p>Your data is yours. We use encryption to protect your personal information and location data. We never share your contact details with third parties without your explicit consent for booking purposes.</p>
      </InfoSection>

      <InfoSection id="contact-us" title="Contact Us" accent>
        <div className="max-w-xl">
          <p className="mb-8">Have questions, feedback, or want to partner with us? Reach out through our official channels.</p>
          
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white border border-rule outline-none focus:border-accent transition-all shadow-inner-soft" />
              <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-xl bg-white border border-rule outline-none focus:border-accent transition-all shadow-inner-soft" />
            </div>
            <input type="text" placeholder="Subject" className="w-full px-4 py-3 rounded-xl bg-white border border-rule outline-none focus:border-accent transition-all shadow-inner-soft" />
            <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-xl bg-white border border-rule outline-none focus:border-accent transition-all shadow-inner-soft resize-none"></textarea>
            <button className="px-8 py-3 bg-accent text-white font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all">
              Send Message
            </button>
          </form>
        </div>
      </InfoSection>
    </div>
  );
}
