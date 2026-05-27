'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const WIDGETS = [
  {
    id: 1,
    theme: 'classic',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/linen-pants.png" alt="Linen Pants" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>Someone in Milan, Italy</div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 400, lineHeight: 1.3 }}>Just purchased <span style={{ fontWeight: 600 }}>Linen Trousers</span></div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>2 hours ago</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      color: 'var(--text-primary)'
    }
  },
  {
    id: 2,
    theme: 'dark',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/sneakers.png" alt="Minimalist Sneaker" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', color: '#FDFBF7', fontWeight: 400, lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>15 people</strong> bought the <strong style={{ fontWeight: 600 }}>Minimalist Sneaker</strong> today
          </div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#2C3527',
      border: '1px solid #4A5445',
      boxShadow: '0 12px 30px -5px rgba(44, 53, 39, 0.5)'
    }
  },
  {
    id: 3,
    theme: 'glass',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/bridal-gown.png" alt="Bridal Gown" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 400, lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 700 }}>24 people</strong> joined the waitlist for the <strong style={{ fontWeight: 600 }}>Silk Bodice Gown</strong>
          </div>
          <a href="#" style={{ display: 'inline-block', fontSize: '13px', color: 'var(--accent)', fontWeight: 600, marginTop: '6px', textDecoration: 'none' }}>
            Join waitlist &rarr;
          </a>
        </div>
      </div>
    ),
    style: {
      backgroundColor: 'rgba(253, 251, 247, 0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 12px 32px 0 rgba(196, 155, 106, 0.15)'
    }
  }
];

export function HeroWidget() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % WIDGETS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      marginTop: '64px', 
      position: 'relative', 
      width: '100%', 
      maxWidth: '800px', 
      height: '360px', 
      backgroundColor: 'var(--bg-base)', 
      borderRadius: 'var(--radius-xl)', 
      border: '1px solid var(--border-subtle)', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'flex-start', 
      padding: '32px' 
    }}>
      {/* Fake Storefront background */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: 0.05, 
        backgroundImage: 'linear-gradient(45deg, var(--text-primary) 25%, transparent 25%), linear-gradient(-45deg, var(--text-primary) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--text-primary) 75%), linear-gradient(-45deg, transparent 75%, var(--text-primary) 75%)', 
        backgroundSize: '20px 20px' 
      }}></div>
      
      {/* Container for absolute positioning of widgets to allow crossfading */}
      <div style={{ position: 'relative', width: '380px', height: '100px', zIndex: 10 }}>
        {WIDGETS.map((widget, index) => {
          const isActive = index === activeIndex;
          
          return (
            <div 
              key={widget.id}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', 
                padding: '20px', 
                borderRadius: '16px',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.95)',
                pointerEvents: isActive ? 'auto' : 'none',
                ...widget.style
              }}
            >
              {widget.render()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
