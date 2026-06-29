'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const WIDGETS = [
  {
    id: 1,
    theme: 'paper',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <CheckIcon color="#1a1a1a" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>Sarah M. from NY bought Aura Pro</div>
          <div style={{ fontSize: '13px', color: '#888' }}>21h ago</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#fdfdfc',
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
      border: '1px solid #E5E5E5',
      borderRadius: '4px',
      padding: '16px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  },
  {
    id: 2,
    theme: 'brutalist',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <CheckIcon color="#fff" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '15px', color: '#fff', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>Sarah M. from NY bought Aura Pro</div>
          <div style={{ fontSize: '13px', color: '#B4D496', fontFamily: 'monospace' }}>21h ago</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#6B9E3D',
      border: '4px solid #000',
      borderRadius: '0',
      padding: '16px 20px',
      boxShadow: '4px 4px 0px #000'
    }
  },
  {
    id: 3,
    theme: 'glass',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <CheckIcon color="#1a1a1a" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>Sarah M. from NY bought Aura Pro</div>
          <div style={{ fontSize: '13px', color: '#666' }}>21h ago</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
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
