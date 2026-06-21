'use client';

import { useTransition, useState, useEffect } from 'react';
import { updateAppearanceConfig } from './actions';

type ThemeConfig = {
  theme_preset?: string;
  hover_animation?: string;
  bg_color?: string;
  text_color?: string;
  font_family?: string;
  border_radius?: number;
  position?: string;
  size?: string;
  slide_animation?: string;
};

const ANIMATIONS = [
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-in-left', label: 'Slide In Left' },
  { id: 'slide-in-right', label: 'Slide In Right' },
];

const HOVER_ANIMATIONS = [
  { id: 'none', label: 'No Hover Animation' },
  { id: 'lift', label: 'Lift Up' },
  { id: 'glow', label: 'Glow Effect' },
  { id: 'scale', label: 'Scale Up' },
];

const PRESETS = [
  { id: 'default', label: 'Default', bg: '#ffffff', text: '#111827', radius: 8 },
  { id: 'glassmorphism', label: 'Glassmorphism', bg: 'rgba(255, 255, 255, 0.7)', text: '#111827', radius: 16 },
  { id: 'dark', label: 'Dark Mode', bg: '#1f2937', text: '#f9fafb', radius: 8 },
  { id: 'playful', label: 'Playful', bg: '#fef3c7', text: '#92400e', radius: 24 },
  { id: 'minimalist', label: 'Minimalist', bg: '#fafafa', text: '#52525b', radius: 0 },
];

const POSITIONS = [
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
];

const SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

export function AppearanceForm({ initialTheme }: { initialTheme: ThemeConfig }) {
  const [isPending, startTransition] = useTransition();
  const [previewVisible, setPreviewVisible] = useState(false);

  const [theme, setTheme] = useState<ThemeConfig>({
    theme_preset: initialTheme.theme_preset || 'default',
    hover_animation: initialTheme.hover_animation || 'none',
    bg_color: initialTheme.bg_color || '#ffffff',
    text_color: initialTheme.text_color || '#1a1a1a',
    font_family: initialTheme.font_family || 'Inter, sans-serif',
    border_radius: initialTheme.border_radius || 8,
    position: initialTheme.position || 'bottom-left',
    size: initialTheme.size || 'medium',
    slide_animation: initialTheme.slide_animation || 'slide-up',
  });

  // Trigger the preview animation on mount and whenever theme changes
  useEffect(() => {
    setPreviewVisible(false);
    const t = setTimeout(() => setPreviewVisible(true), 150);
    return () => clearTimeout(t);
  }, [theme.position, theme.size, theme.slide_animation, theme.bg_color, theme.text_color, theme.border_radius, theme.font_family]);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateAppearanceConfig(formData);
        alert('Appearance configuration saved successfully.');
      } catch (error: any) {
        alert('Error saving configuration: ' + error.message);
      }
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTheme(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const getTransform = (hidden: boolean) => {
      if (!hidden) return 'translate(0, 0)';
      switch (theme.slide_animation) {
        case 'slide-up': return 'translateY(10px)';
        case 'slide-in-left': return 'translateX(-10px)';
        case 'slide-in-right': return 'translateX(10px)';
        default: return 'translateY(10px)';
      }
    };

    const transformValue = getTransform(!previewVisible);

    switch (theme.position) {
      case 'bottom-right':
        return { ...base, bottom: '12px', right: '12px', transform: transformValue };
      case 'top-left':
        return { ...base, top: '12px', left: '12px', transform: transformValue };
      case 'top-right':
        return { ...base, top: '12px', right: '12px', transform: transformValue };
      default: // bottom-left
        return { ...base, bottom: '12px', left: '12px', transform: transformValue };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
      
      <form action={handleSubmit} className="card">
        <div className="card-header">
          <h2 className="card-title">Theme Settings</h2>
          <p className="card-description">Customize the look and feel of the widget.</p>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Theme Presets */}
          <div className="input-group">
            <label className="input-label">Theme Preset</label>
            <input type="hidden" name="theme_preset" value={theme.theme_preset} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setTheme(prev => ({
                      ...prev,
                      theme_preset: preset.id,
                      bg_color: preset.bg,
                      text_color: preset.text,
                      border_radius: preset.radius
                    }));
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: theme.theme_preset === preset.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: preset.bg,
                    color: preset.text,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                    backdropFilter: preset.id === 'glassmorphism' ? 'blur(10px)' : 'none',
                    boxShadow: theme.theme_preset === preset.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <details style={{ background: 'var(--bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Fine Tune Colors & Fonts</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <div className="input-group">
                <label htmlFor="bg_color" className="input-label">Background Color</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    id="bg_color" 
                    name="bg_color" 
                    value={theme.bg_color?.startsWith('rgba') ? '#ffffff' : theme.bg_color} 
                    onChange={handleChange}
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="input" 
                    value={theme.bg_color} 
                    onChange={handleChange}
                    name="bg_color"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="text_color" className="input-label">Text Color</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    id="text_color" 
                    name="text_color" 
                    value={theme.text_color} 
                    onChange={handleChange}
                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="input" 
                    value={theme.text_color} 
                    onChange={handleChange}
                    name="text_color"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="font_family" className="input-label">Font Family</label>
                <select 
                  id="font_family" 
                  name="font_family" 
                  className="input" 
                  value={theme.font_family}
                  onChange={handleChange}
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="System-ui, sans-serif">System UI</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="border_radius" className="input-label">Border Radius (px)</label>
                <input 
                  type="number" 
                  id="border_radius" 
                  name="border_radius" 
                  className="input" 
                  value={theme.border_radius}
                  onChange={handleChange}
                  placeholder="e.g., 8"
                />
              </div>
            </div>
          </details>

          {/* Hover Animation Picker */}
          <div className="input-group">
            <label className="input-label">Hover Animation</label>
            <input type="hidden" name="hover_animation" value={theme.hover_animation} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {HOVER_ANIMATIONS.map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setTheme(prev => ({ ...prev, hover_animation: anim.id }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: theme.hover_animation === anim.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: theme.hover_animation === anim.id ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' : 'var(--bg-base)',
                    color: theme.hover_animation === anim.id ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: theme.hover_animation === anim.id ? 600 : 400,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                  }}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div className="input-group">
            <label className="input-label">Widget Size</label>
            <input type="hidden" name="size" value={theme.size} />
            <div style={{ 
              display: 'flex', 
              gap: '8px',
            }}>
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTheme(prev => ({ ...prev, size: s.id }))}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: theme.size === s.id 
                      ? '2px solid var(--accent)' 
                      : '1px solid var(--border)',
                    background: theme.size === s.id 
                      ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                      : 'var(--bg-base)',
                    color: theme.size === s.id 
                      ? 'var(--accent)' 
                      : 'var(--text-secondary)',
                    fontWeight: theme.size === s.id ? 600 : 400,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position Picker */}
          <div className="input-group">
            <label className="input-label">Widget Position</label>
            <input type="hidden" name="position" value={theme.position} />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
            }}>
              {POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setTheme(prev => ({ ...prev, position: pos.id }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: theme.position === pos.id 
                      ? '2px solid var(--accent)' 
                      : '1px solid var(--border)',
                    background: theme.position === pos.id 
                      ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                      : 'var(--bg-base)',
                    color: theme.position === pos.id 
                      ? 'var(--accent)' 
                      : 'var(--text-secondary)',
                    fontWeight: theme.position === pos.id ? 600 : 400,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                  }}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Picker */}
          <div className="input-group">
            <label className="input-label">Entry Animation</label>
            <input type="hidden" name="slide_animation" value={theme.slide_animation} />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
            }}>
              {ANIMATIONS.map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setTheme(prev => ({ ...prev, slide_animation: anim.id }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: theme.slide_animation === anim.id 
                      ? '2px solid var(--accent)' 
                      : '1px solid var(--border)',
                    background: theme.slide_animation === anim.id 
                      ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                      : 'var(--bg-base)',
                    color: theme.slide_animation === anim.id 
                      ? 'var(--accent)' 
                      : 'var(--text-secondary)',
                    fontWeight: theme.slide_animation === anim.id ? 600 : 400,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                  }}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="card-footer">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Appearance'}
          </button>
        </div>
      </form>

      {/* Live Preview — simulated browser window */}
      <div style={{ position: 'sticky', top: 'calc(var(--topbar-height) + var(--space-6))' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1rem', fontWeight: 600 }}>Live Preview</h3>
        
        {/* Simulated browser chrome */}
        <div style={{
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          {/* Title bar */}
          <div style={{
            background: 'var(--bg-elevated, #f5f5f5)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
            </div>
            <div style={{
              flex: 1,
              background: 'var(--bg-base, #fff)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              border: '1px solid var(--border)',
            }}>
              yourstore.com
            </div>
          </div>

          {/* "Page" content area */}
          <div style={{
            position: 'relative',
            height: '300px',
            background: 'var(--bg-base, #fff)',
            overflow: 'hidden',
          }}>
            {/* Faint placeholder content lines */}
            <div style={{ padding: '24px', opacity: 0.15 }}>
              <div style={{ height: '16px', width: '60%', background: 'var(--text-primary)', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '12px', width: '90%', background: 'var(--text-primary)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '75%', background: 'var(--text-primary)', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '85%', background: 'var(--text-primary)', borderRadius: '4px', marginBottom: '20px' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ height: '80px', width: '80px', background: 'var(--text-primary)', borderRadius: '8px' }} />
                <div style={{ height: '80px', width: '80px', background: 'var(--text-primary)', borderRadius: '8px' }} />
                <div style={{ height: '80px', width: '80px', background: 'var(--text-primary)', borderRadius: '8px' }} />
              </div>
            </div>

            {/* The actual widget toast preview */}
            {(() => {
              const sizeScale = theme.size === 'small' ? 0.85 : theme.size === 'large' ? 1.15 : 1;
              const basePadX = 14 * sizeScale;
              const basePadY = 10 * sizeScale;
              const baseGap = 10 * sizeScale;
              const iconSize = Math.round(14 * sizeScale);
              const titleSize = Math.round(12 * sizeScale);
              const msgSize = Math.round(11 * sizeScale);
              const timeSize = Math.round(9 * sizeScale);
              const maxW = Math.round(260 * sizeScale);
              return (
                <div style={{
                  ...getPositionStyles(),
                  backgroundColor: theme.bg_color,
                  color: theme.text_color,
                  fontFamily: theme.font_family,
                  borderRadius: `${theme.border_radius}px`,
                  padding: `${basePadY}px ${basePadX}px`,
                  boxShadow: theme.theme_preset === 'glassmorphism' 
                    ? '0 8px 32px rgba(0, 0, 0, 0.1)' 
                    : '0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
                  backdropFilter: theme.theme_preset === 'glassmorphism' ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: theme.theme_preset === 'glassmorphism' ? 'blur(10px)' : 'none',
                  border: theme.theme_preset === 'glassmorphism' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${baseGap}px`,
                  maxWidth: `${maxW}px`,
                  opacity: previewVisible ? 1 : 0,
                  transform: previewVisible 
                    ? (theme.hover_animation === 'lift' ? 'translateY(-4px)' : 
                       theme.hover_animation === 'scale' ? 'scale(1.02)' : 'none') 
                    : undefined,
                  pointerEvents: 'none',
                }}>
                  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <p style={{ margin: 0, fontSize: `${titleSize}px`, fontWeight: 600, color: 'inherit' }}>Someone from Mumbai</p>
                    <p style={{ margin: 0, fontSize: `${msgSize}px`, opacity: 0.8, color: 'inherit' }}>just purchased Classic Tee</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: `${timeSize}px`, opacity: 0.5, color: 'inherit' }}>2 minutes ago</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <p style={{ 
          marginTop: 'var(--space-3)', 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          This is exactly how the widget will appear on your store.
        </p>
      </div>
    </div>
  );
}
