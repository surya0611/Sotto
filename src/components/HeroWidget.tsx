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
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % WIDGETS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;
    
    setTilt({ x: yPct * -5, y: xPct * 5 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ 
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
      padding: '32px',
      transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
      transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease',
      boxShadow: isHovered ? 'var(--shadow-xl)' : 'none',
      cursor: 'pointer'
    }}>
      {/* E-Commerce Wireframe background */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: 0.4, 
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Nav */}
          <rect x="40" y="24" width="80" height="12" rx="6" fill="var(--border-hover)" opacity="0.6" />
          <rect x="680" y="24" width="80" height="12" rx="6" fill="var(--border-hover)" opacity="0.6" />
          <line x1="0" y1="56" x2="800" y2="56" stroke="var(--border-hover)" strokeWidth="1" opacity="0.5" />

          {/* Product Image */}
          <rect x="40" y="88" width="340" height="340" rx="16" fill="var(--bg-card)" stroke="var(--border-hover)" strokeWidth="2" opacity="0.6" />
          
          {/* Product Details */}
          <rect x="420" y="88" width="240" height="24" rx="8" fill="var(--border-hover)" opacity="0.5" />
          <rect x="420" y="128" width="120" height="16" rx="8" fill="var(--border-hover)" opacity="0.4" />
          
          <rect x="420" y="176" width="300" height="8" rx="4" fill="var(--border-hover)" opacity="0.3" />
          <rect x="420" y="196" width="280" height="8" rx="4" fill="var(--border-hover)" opacity="0.3" />
          <rect x="420" y="216" width="160" height="8" rx="4" fill="var(--border-hover)" opacity="0.3" />
          
          {/* Add to Cart Button */}
          <rect x="420" y="256" width="340" height="48" rx="8" fill="var(--border-hover)" opacity="0.5" />
        </svg>
      </div>
      
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
