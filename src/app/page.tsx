'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroWidget } from '@/components/HeroWidget';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view-fallback');
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.1 }
      );
      document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
      
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-deep)', minHeight: '100vh', position: 'relative' }}>
      {/* Background Texture Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.03, pointerEvents: 'none',
        backgroundImage: 'url(/noise.txt)', backgroundRepeat: 'repeat'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigation */}
        <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="brand-logo-container">
              S<img src="/logo.svg" className="brand-logo-icon-inline" alt="o" />TTO
            </div>
          </Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </nav>

        <main className="landing-container">
          {/* Hero Section */}
          <section className="hero-section stagger-in">
            <div className="badge badge-accent" style={{ marginBottom: '16px' }}>Now in Beta</div>
            <h1 className="hero-title">Social proof, <em style={{ fontStyle: 'italic', fontWeight: 400 }}>sotto voce</em>.</h1>
            <p className="hero-subtitle">
              Generic popups scream at your customers. Sotto provides gentle, premium social proof crafted exclusively for design-forward DTC brands.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <Link href="/signup" className="btn btn-primary btn-lg">Start Free Trial</Link>
              <Link href="#pricing" className="btn btn-secondary btn-lg">View Pricing</Link>
            </div>
            
            <HeroWidget />
            
            {/* Trusted By Marquee */}
            <div className="scroll-reveal" style={{ marginTop: '64px', width: '100%' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--fg-subtle)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Trusted by modern brands & platforms
              </p>
              <div className="marquee-container">
                <div className="marquee-content">
                  {/* Duplicated for seamless loop */}
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 'var(--s-12)' }}>
                      <img src="/shopify.svg" alt="Shopify" className="brand-logo-img" />
                      <img src="/typeform.svg" alt="Typeform" className="brand-logo-img" />
                      <img src="/google.svg" alt="Google" className="brand-logo-img" />
                      <img src="/razorpay.svg" alt="Razorpay" className="brand-logo-img" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="scroll-reveal" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>Built for restraint.</h2>
              <p className="hero-subtitle" style={{ fontSize: '1rem', marginTop: '16px', marginLeft: 'auto', marginRight: 'auto' }}>
                We stripped away the noise, the fake timers, and the aggressive animations to focus entirely on beautiful, quiet conversion lifts.
              </p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card scroll-reveal">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Premium Aesthetics</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Zero CSS required. Sotto seamlessly blends into your storefront with elegant, minimal design presets.</p>
              </div>
              <div className="feature-card scroll-reveal" style={{ animationDelay: '100ms' }}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Frequency Capping</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Never annoy a customer. Set strict limits on how often social proof appears during a browsing session.</p>
              </div>
              <div className="feature-card scroll-reveal" style={{ animationDelay: '200ms' }}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>One-Click Integrations</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Connects instantly to Shopify, Razorpay, Typeform, and Google Forms to pull real, verified purchase data.</p>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="pricing-section">
            <div className="scroll-reveal">
              <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>Simple, transparent pricing.</h2>
              <p className="hero-subtitle" style={{ fontSize: '1rem', marginTop: '16px', marginLeft: 'auto', marginRight: 'auto' }}>
                Start for free, upgrade when you need more volume.
              </p>
            </div>
            
            <div className="pricing-grid">
              <div className="pricing-card scroll-reveal">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Free</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Perfect for testing the waters.</p>
                <div className="pricing-price">$0<span className="pricing-period">/mo</span></div>
                <ul className="checklist" style={{ textAlign: 'left', marginTop: '16px', marginBottom: '24px' }}>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">Up to 1,000 events/mo</span></li>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">1 Domain</span></li>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">Standard Support</span></li>
                </ul>
                <Link href="/signup" className="btn btn-secondary w-full" style={{ marginTop: 'auto' }}>Get Started</Link>
              </div>
              
              <div className="pricing-card popular scroll-reveal" style={{ animationDelay: '100ms' }}>
                <div className="pricing-badge">Most Popular</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Boutique</h3>
                <p style={{ color: 'var(--text-secondary)' }}>For growing luxury storefronts.</p>
                <div className="pricing-price">$49<span className="pricing-period">/mo</span></div>
                <ul className="checklist" style={{ textAlign: 'left', marginTop: '16px', marginBottom: '24px' }}>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">Up to 50,000 events/mo</span></li>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">3 Domains</span></li>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">Priority Support</span></li>
                </ul>
                <Link href="/signup" className="btn btn-primary w-full" style={{ marginTop: 'auto' }}>Start Free Trial</Link>
              </div>

              <div className="pricing-card scroll-reveal" style={{ animationDelay: '200ms' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Enterprise</h3>
                <p style={{ color: 'var(--text-secondary)' }}>High volume, multi-region brands.</p>
                <div className="pricing-price">$149<span className="pricing-period">/mo</span></div>
                <ul className="checklist" style={{ textAlign: 'left', marginTop: '16px', marginBottom: '24px' }}>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">Up to 500,000 events/mo</span></li>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">10 Domains</span></li>
                  <li className="checklist-item"><span className="checklist-check" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)', color: '#fff' }}>✓</span><span className="checklist-text">Dedicated Success Manager</span></li>
                </ul>
                <Link href="/signup" className="btn btn-secondary w-full" style={{ marginTop: 'auto' }}>Contact Sales</Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="landing-footer scroll-reveal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="brand-logo-container">
              S<img src="/logo.svg" className="brand-logo-icon-inline" alt="o" />TTO
            </div>
          </div>
          <p>© {new Date().getFullYear()} Sotto. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
