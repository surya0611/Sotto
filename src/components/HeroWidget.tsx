'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const WIDGETS = [
  {
    id: 1,
    theme: 'paper',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/linen-pants.png" alt="Linen Pants" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: 'var(--fg-subtle)', fontWeight: 500, marginBottom: '2px', fontFamily: 'serif', fontStyle: 'italic' }}>Someone in Milan, Italy</div>
          <div style={{ fontSize: '14px', color: 'var(--fg)', fontWeight: 400, lineHeight: 1.3 }}>Just purchased <span style={{ fontWeight: 600 }}>Linen Trousers</span></div>
          <div style={{ fontSize: '12px', color: 'var(--fg-muted)', marginTop: '4px' }}>2 hours ago</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#FDFBF7', /* Warm paper */
      border: '1px solid #E8E5DF',
      boxShadow: '0 8px 30px rgba(196, 155, 106, 0.12), inset 0 0 40px rgba(196, 155, 106, 0.03)',
      color: 'var(--fg)'
    }
  },
  {
    id: 2,
    theme: 'glass',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/handheld-fan.jpg" alt="Minimalist Handheld Fan" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--fg)', fontWeight: 400, lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 700 }}>24 people</strong> joined the waitlist for the <strong style={{ fontWeight: 600 }}>Minimalist Handheld Fan</strong>
          </div>
          <a href="#" style={{ display: 'inline-block', fontSize: '13px', color: 'var(--primary)', fontWeight: 600, marginTop: '6px', textDecoration: 'none' }}>
            Join waitlist &rarr;
          </a>
        </div>
      </div>
    ),
    style: {
      backgroundColor: 'rgba(253, 251, 247, 0.65)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 12px 32px 0 rgba(196, 155, 106, 0.15)',
      borderRadius: '16px'
    }
  },
  {
    id: 3,
    theme: 'brutalist',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', border: '2px solid #000', flexShrink: 0, position: 'relative', backgroundColor: '#000', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Abstract UI Kit Graphic */}
          <div style={{ width: '100%', height: '12px', backgroundColor: '#4ADE80' }}></div>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            <div style={{ flex: 1, backgroundColor: '#333' }}></div>
            <div style={{ flex: 2, backgroundColor: '#333' }}></div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', color: '#000', fontWeight: 600, lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            <strong style={{ fontWeight: 800, background: '#000', color: '#4ADE80', padding: '0 4px' }}>15 creators</strong> downloaded the <strong style={{ fontWeight: 800 }}>Sotto UI Kit</strong> today
          </div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#4ADE80', /* Vibrant green background */
      border: '3px solid #000',
      borderRadius: '0',
      boxShadow: '6px 6px 0px #000',
      color: '#000'
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
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Nav */}
          <rect x="60" y="30" width="80" height="16" rx="8" fill="var(--fg-subtle)" opacity="0.3" />
          <rect x="340" y="32" width="40" height="12" rx="6" fill="var(--fg-subtle)" opacity="0.15" />
          <rect x="400" y="32" width="40" height="12" rx="6" fill="var(--fg-subtle)" opacity="0.15" />
          <rect x="460" y="32" width="40" height="12" rx="6" fill="var(--fg-subtle)" opacity="0.15" />
          <rect x="700" y="30" width="40" height="16" rx="8" fill="var(--fg-subtle)" opacity="0.3" />
          <line x1="0" y1="70" x2="800" y2="70" stroke="var(--border-hover)" strokeWidth="1" opacity="0.8" />

          {/* Product Image */}
          <rect x="60" y="110" width="320" height="400" rx="16" fill="var(--bg-card)" stroke="var(--border-hover)" strokeWidth="2" opacity="0.8" />
          
          {/* Product Details */}
          <rect x="420" y="110" width="100" height="10" rx="5" fill="var(--fg-subtle)" opacity="0.2" />
          <rect x="420" y="130" width="220" height="30" rx="8" fill="var(--fg-subtle)" opacity="0.4" />
          <rect x="420" y="175" width="80" height="20" rx="6" fill="var(--fg-subtle)" opacity="0.3" />
          
          <rect x="420" y="215" width="320" height="10" rx="5" fill="var(--fg-subtle)" opacity="0.2" />
          <rect x="420" y="235" width="300" height="10" rx="5" fill="var(--fg-subtle)" opacity="0.2" />
          <rect x="420" y="255" width="240" height="10" rx="5" fill="var(--fg-subtle)" opacity="0.2" />
          
          {/* Add to Cart Button */}
          <rect x="420" y="295" width="320" height="50" rx="12" fill="var(--fg-subtle)" opacity="0.4" />
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
