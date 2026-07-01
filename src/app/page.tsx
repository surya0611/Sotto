'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroWidget } from '@/components/HeroWidget';
import { FaqSection } from '@/components/Faq';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      
      {/* Aurora Mesh Backdrop */}
      <div className="aurora-container">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>

      {/* Background Texture Overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.03, pointerEvents: 'none',
        backgroundImage: 'url(/noise.txt)', backgroundRepeat: 'repeat'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navigation */}
        <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
          <div className="landing-nav-inner">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div className="brand-logo-container">
                S<img src="/logo.svg" className="brand-logo-icon-inline" alt="o" />TTO
              </div>
            </Link>
            <div className="nav-buttons" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link href="/login" className="btn btn-ghost btn-sm login-btn">Log in</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          </div>
        </nav>

        <main className="landing-container">
          {/* Hero Section */}
          <section className="hero-section">
            <Link href="#pricing" className="badge badge-accent" style={{ marginBottom: '16px', textDecoration: 'none' }}>Free during beta — limited spots</Link>
            <h1 className="hero-title">Social proof, <em style={{ fontStyle: 'italic', fontWeight: 400 }}>sotto voce</em>.</h1>
            <p className="hero-subtitle">
              Most social proof tools were built for volume. Sotto was built for brands that care about what their store looks like.
            </p>
            <div className="hero-buttons">
              <Link href="/signup" className="btn btn-primary btn-lg">Try it free — no card required</Link>
            </div>
            
            <HeroWidget />
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>Everything you need. Nothing you don't.</h2>
              <p className="hero-subtitle" style={{ fontSize: '1rem', marginTop: '16px', marginLeft: 'auto', marginRight: 'auto' }}>
                We stripped away the noise, the fake timers, and the aggressive animations to focus entirely on beautiful, quiet conversion lifts.
              </p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Premium Aesthetics</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Sotto's widget styles are designed to match your storefront, not fight it. No custom CSS needed — pick a preset and it just fits.</p>
              </div>
              <div className="feature-card" style={{ animationDelay: '100ms' }}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Frequency Capping</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Set a hard limit on how many times a widget appears per browsing session. Customers never feel followed or pressured.</p>
              </div>
              <div className="feature-card" style={{ animationDelay: '200ms' }}>
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>One-Click Integrations</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Pulls real, verified data from Shopify, Razorpay, Typeform, and Google Forms. No fake events, no manual setup.</p>
              </div>
            </div>
          </section>

          {/* Pricing Section Removed */}
          
          
          <FaqSection />
        </main>

        <footer className="landing-footer">
          <div className="landing-footer-grid">
            <div>
              <div className="brand-logo-container" style={{ marginBottom: '16px' }}>
                S<img src="/logo.svg" className="brand-logo-icon-inline" alt="o" />TTO
              </div>
              <p>Quiet social proof for premium storefronts.</p>
            </div>
            <div>
              <h4 className="landing-footer-heading">Product</h4>
              <Link href="#" className="landing-footer-link">Features</Link>
              <Link href="#" className="landing-footer-link">Integrations</Link>
              <Link href="#" className="landing-footer-link">Changelog</Link>
            </div>
            <div>
              <h4 className="landing-footer-heading">Company</h4>
              <Link href="#" className="landing-footer-link">About</Link>
              <Link href="#" className="landing-footer-link">Contact</Link>
              <Link href="#" className="landing-footer-link">Privacy Policy</Link>
              <Link href="#" className="landing-footer-link">Terms of Service</Link>
            </div>
          </div>
          <div className="landing-footer-divider"></div>
          <div className="landing-footer-bottom">
            <p>© {new Date().getFullYear()} Sotto. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
