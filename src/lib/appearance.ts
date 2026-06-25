import { PAPER_TEXTURE } from "./textures";
// STRICT CONSTRAINT: Zero framework dependencies (No React, No Next.js imports)
// This file is compiled into the static widget.js AND consumed by the React Dashboard.

export type SurfaceStyleKey = 
  | 'flat' 
  | 'glassmorphism' 
  | 'neumorphism' 
  | 'grain' 
  | 'paper' 
  | 'linen' 
  | 'clay' 
  | 'brutalist' 
  | 'y2k';

export interface AppearanceConfig {
  surface_style: SurfaceStyleKey;
  bg_color: string;           // Hex color
  bg_opacity: number;         // 0 - 100
  text_color: string;         // Hex color
  font_family: string;
  border_radius: number;      // px
  border_width: number;       // px
  border_color: string;       // Hex color
  
  // Style-specific
  blur_intensity?: number;    // Glassmorphism (px)
  texture_intensity?: number; // Grain/Paper/Linen (0-100 opacity)
  sheen_color?: string;       // Y2K (Hex)
}

// 64x64 heavily compressed grayscale noise (4.7KB)
const NOISE_TEXTURE = "data:image/png;base64,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";

export const DEFAULT_APPEARANCE_CONFIGS: Record<SurfaceStyleKey, AppearanceConfig> = {
  flat: {
    surface_style: 'flat',
    bg_color: '#ffffff',
    bg_opacity: 100,
    text_color: '#1a1a1a',
    font_family: 'Inter, sans-serif',
    border_radius: 8,
    border_width: 1,
    border_color: '#e5e7eb'
  },
  glassmorphism: {
    surface_style: 'glassmorphism',
    bg_color: '#ffffff',
    bg_opacity: 15,
    text_color: '#1a1a1a',
    font_family: 'Inter, sans-serif',
    border_radius: 12,
    border_width: 1,
    border_color: '#ffffff',
    blur_intensity: 12
  },
  neumorphism: {
    surface_style: 'neumorphism',
    bg_color: '#e0e0e0', // Strong default to prevent contrast/visibility issues
    bg_opacity: 100,
    text_color: '#333333',
    font_family: 'Inter, sans-serif',
    border_radius: 12,
    border_width: 0,
    border_color: '#000000'
  },
  grain: {
    surface_style: 'grain',
    bg_color: '#f8f8f8',
    bg_opacity: 100,
    text_color: '#1a1a1a',
    font_family: 'Inter, sans-serif',
    border_radius: 8,
    border_width: 1,
    border_color: '#e5e7eb',
    texture_intensity: 20
  },
  paper: {
    surface_style: 'paper',
    bg_color: '#fdfbf7',
    bg_opacity: 100,
    text_color: '#2a2626',
    font_family: 'Georgia, serif',
    border_radius: 4,
    border_width: 1,
    border_color: '#e2dfd8',
    texture_intensity: 10
  },
  linen: {
    surface_style: 'linen',
    bg_color: '#f4f5f6',
    bg_opacity: 100,
    text_color: '#2d3748',
    font_family: 'Inter, sans-serif',
    border_radius: 8,
    border_width: 0,
    border_color: '#000000',
    texture_intensity: 15
  },
  clay: {
    surface_style: 'clay',
    bg_color: '#f0f4ff',
    bg_opacity: 100,
    text_color: '#1e3a8a',
    font_family: 'Inter, sans-serif',
    border_radius: 20,
    border_width: 0,
    border_color: '#000000'
  },
  brutalist: {
    surface_style: 'brutalist',
    bg_color: '#ffffff',
    bg_opacity: 100,
    text_color: '#000000',
    font_family: 'monospace',
    border_radius: 0,
    border_width: 3,
    border_color: '#000000'
  },
  y2k: {
    surface_style: 'y2k',
    bg_color: '#ffffff',
    bg_opacity: 100,
    text_color: '#000000',
    font_family: 'Inter, sans-serif',
    border_radius: 12,
    border_width: 1,
    border_color: '#ffffff',
    sheen_color: '#00f0ff'
  }
};

// --- Utilities ---

export function hexToRGB(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(char => char + char).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Inline HSL Math (Dependency Free)
export function adjustLightness(hex: string, amount: number): string {
  let [r, g, b] = hexToRGB(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  l = Math.max(0, Math.min(1, l + amount));

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hexStr = Math.round(x * 255).toString(16);
    return hexStr.length === 1 ? '0' + hexStr : hexStr;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function computeContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  const [r1, g1, b1] = hexToRGB(hex1);
  const [r2, g2, b2] = hexToRGB(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (lightest + 0.05) / (darkest + 0.05);
}

// --- CSS Generator ---

export function computeWidgetStyles(config: AppearanceConfig): any {
  const c = { ...DEFAULT_APPEARANCE_CONFIGS[config.surface_style], ...config };
  const [r, g, b] = hexToRGB(c.bg_color);
  const bgRgba = `rgba(${r}, ${g}, ${b}, ${c.bg_opacity / 100})`;

  const container: any = {
    fontFamily: c.surface_style === 'brutalist' ? 'monospace' : c.font_family,
    color: c.text_color,
    position: 'relative',
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: `${c.border_radius}px`,
  };

  const bg: any = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    backgroundColor: bgRgba,
    border: c.border_width > 0 ? `${c.border_width}px solid ${c.border_color}` : 'none',
    borderRadius: `${c.border_radius}px`,
  };

  if (c.surface_style === 'glassmorphism') {
    bg.backdropFilter = `blur(${c.blur_intensity || 12}px)`;
    bg.WebkitBackdropFilter = `blur(${c.blur_intensity || 12}px)`; // Safari fallback
  }

  if (c.surface_style === 'neumorphism') {
    const light = adjustLightness(c.bg_color, 0.15);
    const dark = adjustLightness(c.bg_color, -0.15);
    bg.boxShadow = `6px 6px 12px ${dark}, -6px -6px 12px ${light}`;
  }

  if (c.surface_style === 'clay') {
    bg.boxShadow = `inset -4px -4px 8px rgba(0,0,0,0.1), inset 4px 4px 8px rgba(255,255,255,0.7), 0 8px 16px rgba(0,0,0,0.1)`;
  }

  if (c.surface_style === 'brutalist') {
    bg.boxShadow = `4px 4px 0px 0px #000000`;
  }

  if (['grain', 'paper', 'linen'].includes(c.surface_style)) {
    const intensity = Math.min(100, Math.max(0, c.texture_intensity ?? 20)) / 100;
    
    if (c.surface_style === 'grain') {
      const svgGrain = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="${intensity * 0.5}"/></svg>`;
      const GRAIN_TEXTURE = `data:image/svg+xml,${encodeURIComponent(svgGrain)}`;
      bg.backgroundImage = `url("${GRAIN_TEXTURE}")`;
      bg.backgroundRepeat = 'repeat';
      bg.backgroundSize = '100px 100px';
    } 
    else if (c.surface_style === 'linen') {
      const alpha = (0.15 * intensity).toFixed(3);
      bg.backgroundImage = `
        repeating-linear-gradient(90deg, rgba(0,0,0,${alpha}) 0px, rgba(0,0,0,${alpha}) 1px, transparent 1px, transparent 4px),
        repeating-linear-gradient(0deg, rgba(0,0,0,${alpha}) 0px, rgba(0,0,0,${alpha}) 1px, transparent 1px, transparent 4px)
      `;
      bg.backgroundSize = '4px 4px';
    } 
    else if (c.surface_style === 'paper') {
      // Paper uses an optimized PNG base64 texture.
      // We use a linear-gradient of the base color to act as a wash/opacity mask over the texture.
      const [r, g, b] = hexToRGB(c.bg_color);
      const maskAlpha = (1 - (intensity * 0.8)).toFixed(3); // even at 100% intensity, we wash it slightly so it isn't pure black
      const maskColor = `rgba(${r}, ${g}, ${b}, ${maskAlpha})`;
      bg.backgroundImage = `linear-gradient(${maskColor}, ${maskColor}), url("${PAPER_TEXTURE}")`;
      bg.backgroundRepeat = 'repeat';
      bg.backgroundSize = '128px 128px'; // Same as the generated tile size
    }
  }

  if (c.surface_style === 'y2k') {
    const sheen = c.sheen_color || '#00f0ff';
    const darkSheen = adjustLightness(sheen, -0.2);
    bg.backgroundImage = `linear-gradient(135deg, #e6e6e6 0%, #ffffff 25%, ${sheen} 50%, #d4d4d4 75%, ${darkSheen} 100%)`;
    bg.backgroundSize = '200% 200%';
  }

  return {
    containerStyles: container,
    bgStyles: bg,
    textStyles: { color: c.text_color }
  };
}
