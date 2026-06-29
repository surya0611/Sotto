'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const CheckIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const WIDGETS = [
  {
    id: 1,
    theme: 'paper',
    render: () => (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/linen-pants.png" alt="Linen Pants" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
          <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>Someone in Milan bought <span style={{ fontWeight: 600 }}>Linen Trousers</span></div>
          <div style={{ fontSize: '13px', color: '#888' }}>2 hours ago</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: '#F8F4E6',
      backgroundImage: `linear-gradient(rgba(248, 244, 230, 0.94), rgba(248, 244, 230, 0.94)), url("data:image/png;base64,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")` ,
      backgroundRepeat: 'repeat',
      backgroundSize: '128px 128px',
      border: '1px solid #E8E1CD',
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
        <div style={{ flexShrink: 0, padding: '0 4px' }}>
          <CheckIcon color="#fff" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
          <div style={{ fontSize: '13px', color: '#fff', fontFamily: 'monospace', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>15 creators downloaded the <strong style={{ fontWeight: 800 }}>UI Kit</strong></div>
          <div style={{ fontSize: '12px', color: '#B4D496', fontFamily: 'monospace' }}>5 mins ago</div>
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
        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <Image src="/images/handheld-fan.jpg" alt="Minimalist Handheld Fan" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
          <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>24 people joined waitlist for <span style={{ fontWeight: 600 }}>Minimalist Fan</span></div>
          <div style={{ fontSize: '13px', color: '#666' }}>Just now</div>
        </div>
      </div>
    ),
    style: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '2px solid #FFB6C1',
      borderRadius: '999px', // Pill shaped
      padding: '12px 20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
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
      transform: isHovered ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)` : 'scale(1)',
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
