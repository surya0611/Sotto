
'use client';

import { useTransition, useState, useEffect, useMemo } from 'react';
import { updateAppearanceConfig } from './actions';
import { 
  AppearanceConfig, 
  SurfaceStyleKey, 
  computeWidgetStyles, 
  computeContrastRatio, 
  DEFAULT_APPEARANCE_CONFIGS 
} from '@/lib/appearance';

const SURFACE_STYLES: { id: SurfaceStyleKey, label: string }[] = [
  { id: 'flat', label: 'Flat' },
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'neumorphism', label: 'Neumorphism' },
  { id: 'grain', label: 'Grain' },
  { id: 'paper', label: 'Paper' },
  { id: 'linen', label: 'Linen' },
  { id: 'clay', label: 'Clay' },
  { id: 'brutalist', label: 'Brutalist' },
  { id: 'y2k', label: 'Y2K' },
];

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

const POSITIONS = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
];

const SIZES = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

export function AppearanceForm({ initialTheme }: { initialTheme: any }) {
  const [isPending, startTransition] = useTransition();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Map old config shape to new AppearanceConfig shape if migrating
  const initialAppearance = initialTheme.appearance || {};
  const [theme, setTheme] = useState<AppearanceConfig & any>({
    // New Config properties
    surface_style: initialAppearance.surface_style || 'flat',
    bg_color: initialAppearance.bg_color || '#ffffff',
    text_color: initialAppearance.text_color || '#1a1a1a',
    bg_opacity: initialAppearance.bg_opacity ?? 100,
    font_family: initialAppearance.font_family || 'Inter, sans-serif',
    border_radius: initialAppearance.border_radius ?? 8,
    border_width: initialAppearance.border_width ?? 1,
    border_color: initialAppearance.border_color || '#e5e7eb',
    blur_intensity: initialAppearance.blur_intensity ?? 12,
    texture_intensity: initialAppearance.texture_intensity ?? 20,
    sheen_color: initialAppearance.sheen_color || '#00f0ff',
    
    // Product Image properties
    show_product_image: initialAppearance.show_product_image ?? true,
    image_roundness: initialAppearance.image_roundness ?? 50,

    // Legacy / layout properties
    hover_animation: initialTheme.hover_animation || 'none',
    position: initialTheme.position || 'bottom-left',
    size: initialTheme.size || 'medium',
    slide_animation: initialTheme.slide_animation || 'slide-up',
  });

  const contrastRatio = useMemo(() => {
    return computeContrastRatio(theme.bg_color, theme.text_color);
  }, [theme.bg_color, theme.text_color]);

  useEffect(() => {
    setPreviewVisible(false);
    const t = setTimeout(() => setPreviewVisible(true), 150);
    return () => clearTimeout(t);
  }, [theme.slide_animation, theme.position, theme.surface_style]);

  async function handleSubmit(formData: FormData) {
    // Pack the flat state into the expected DB structure
    const payload = new FormData();
    payload.append('hover_animation', theme.hover_animation);
    payload.append('position', theme.position);
    payload.append('size', theme.size);
    payload.append('slide_animation', theme.slide_animation);
    
    // Convert appearance props to JSON string to store in DB under widget_config.appearance
    const appearanceData = {
      surface_style: theme.surface_style,
      bg_color: theme.bg_color,
      bg_opacity: theme.bg_opacity,
      text_color: theme.text_color,
      font_family: theme.font_family,
      border_radius: theme.border_radius,
      border_width: theme.border_width,
      border_color: theme.border_color,
      blur_intensity: theme.blur_intensity,
      texture_intensity: theme.texture_intensity,
      sheen_color: theme.sheen_color,
      show_product_image: theme.show_product_image,
      image_roundness: theme.image_roundness,
    };
    payload.append('appearance', JSON.stringify(appearanceData));

    startTransition(async () => {
      try {
        await updateAppearanceConfig(payload);
        alert('Appearance configuration saved successfully.');
      } catch (error: any) {
        alert('Error saving configuration: ' + error.message);
      }
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value: any = e.target.value;
    if (e.target.type === 'range' || e.target.type === 'number') value = Number(value);
    setTheme((prev: any) => ({ ...prev, [e.target.name]: value }));
  };

  const setSurfaceStyle = (styleKey: SurfaceStyleKey) => {
    const defaults = DEFAULT_APPEARANCE_CONFIGS[styleKey];
    setTheme((prev: any) => ({
      ...prev,
      surface_style: styleKey,
      // Apply defaults for the new style, but preserve the base color if the user wants
      // Actually, applying defaults makes it easy to switch
      bg_color: defaults.bg_color,
      text_color: defaults.text_color,
      border_radius: defaults.border_radius,
      border_width: defaults.border_width,
      border_color: defaults.border_color,
      bg_opacity: defaults.bg_opacity,
    }));
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
    
    // If in mobile preview mode, force bottom-center position layout
    if (previewMode === 'mobile') {
      return { 
        ...base, 
        bottom: '20px', 
        left: '50%', 
        transform: previewVisible ? 'translateX(-50%) translate(0,0)' : `translateX(-50%) ${transformValue}`
      };
    }

    switch (theme.position) {
      case 'bottom-right': return { ...base, bottom: '12px', right: '12px', transform: transformValue };
      case 'top-left': return { ...base, top: '12px', left: '12px', transform: transformValue };
      case 'top-right': return { ...base, top: '12px', right: '12px', transform: transformValue };
      default: return { ...base, bottom: '12px', left: '12px', transform: transformValue };
    }
  };

  // Generate styles using the pure function engine
  const liveStyles = computeWidgetStyles(theme);

  const mobileMultiplier = previewMode === 'mobile' ? 0.9 : 1.0;
  const sizeScale = (theme.size === 'small' ? 0.85 : theme.size === 'large' ? 1.15 : 1) * mobileMultiplier;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
      {/* Contrast Warning Banner */}
      {contrastRatio < 4.5 && (
        <div style={{ 
          background: '#FEF3C7', 
          color: '#92400E', 
          padding: '12px 16px', 
          borderRadius: '8px',
          border: '1px solid #FDE68A',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}>
          ⚠️ Low Text Contrast ({contrastRatio.toFixed(1)}:1). Consider adjusting colors for better readability (aim for 4.5:1).
        </div>
      )}

      {/* Live Preview */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-4)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Live Preview</h3>
          <div style={{ display: 'flex', background: 'var(--bg-muted)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: previewMode === 'desktop' ? 600 : 500,
                color: previewMode === 'desktop' ? 'var(--text)' : 'var(--text-secondary)',
                background: previewMode === 'desktop' ? 'var(--bg-base)' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                boxShadow: previewMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              style={{
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: previewMode === 'mobile' ? 600 : 500,
                color: previewMode === 'mobile' ? 'var(--text)' : 'var(--text-secondary)',
                background: previewMode === 'mobile' ? 'var(--bg-base)' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                boxShadow: previewMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Mobile
            </button>
          </div>
        </div>
          <div style={{
            position: 'relative',
            borderRadius: previewMode === 'mobile' ? '36px' : 'var(--radius-lg, 12px)',
            border: previewMode === 'mobile' ? '8px solid #000' : '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth: previewMode === 'mobile' ? '320px' : '100%',
            margin: previewMode === 'mobile' ? '0 auto' : '0',
          }}>
            {previewMode === 'desktop' ? (
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
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-base, #fff)',
                padding: '10px',
                display: 'flex',
                justifyContent: 'center',
                position: 'absolute',
                top: 0, left: 0, right: 0,
                zIndex: 10
              }}>
                <div style={{ width: '100px', height: '24px', background: '#000', borderRadius: '12px' }} />
              </div>
            )}
            <div style={{
              position: 'relative',
              height: previewMode === 'mobile' ? '568px' : '400px',
              background: 'var(--bg-base, #fff)',
              overflow: 'hidden',
              paddingTop: previewMode === 'mobile' ? '48px' : '0',
            }}>
            <div style={{ padding: '24px', opacity: 0.15 }}>
              <div style={{ height: '16px', width: '60%', background: 'var(--fg)', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ height: '12px', width: '90%', background: 'var(--fg)', borderRadius: '4px', marginBottom: '8px' }} />
            </div>

            {/* The actual widget toast preview using the shared engine */}
            <div style={{
              ...liveStyles.containerStyles,
              ...getPositionStyles(),
              width: previewMode === 'mobile' ? 'calc(100% - 32px)' : 'max-content',
              maxWidth: previewMode === 'mobile' ? 'none' : `${Math.round(320 * sizeScale)}px`,
              padding: `${Math.round(12 * sizeScale)}px ${Math.round(16 * sizeScale)}px`,
              gap: `${Math.round(12 * sizeScale)}px`,
              opacity: previewVisible ? 1 : 0,
              pointerEvents: 'none',
              transform: previewMode === 'mobile' 
                ? getPositionStyles().transform
                : (previewVisible 
                  ? (theme.hover_animation === 'lift' ? 'translateY(-4px)' : 
                     theme.hover_animation === 'scale' ? 'scale(1.02)' : getPositionStyles().transform) 
                  : getPositionStyles().transform),
            }}>
              <div style={{ ...liveStyles.bgStyles }} />
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: `${Math.round(12 * sizeScale)}px` }}>
                {theme.show_product_image !== false ? (
                  <div style={{ 
                    width: Math.round(36 * sizeScale), 
                    height: Math.round(36 * sizeScale), 
                    borderRadius: `${theme.image_roundness ?? 50}%`,
                    background: '#e2e8f0',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Product" />
                  </div>
                ) : (
                  <svg width={Math.round(20 * sizeScale)} height={Math.round(20 * sizeScale)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: liveStyles.textStyles?.color || theme.text_color }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ margin: 0, fontSize: `${Math.round(13 * sizeScale)}px`, opacity: 0.8, lineHeight: 1.4, ...liveStyles.textStyles }}>
                    Sarah M. just bought a{' '}
                    <span style={{ fontWeight: 600, textDecoration: 'underline' }}>
                      Black Jacket
                    </span>
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: `${Math.round(10 * sizeScale)}px`, opacity: 0.5, lineHeight: 1.3, ...liveStyles.textStyles }}>
                    Just now
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form action={handleSubmit} className="card" style={{ width: '100%' }}>
        <div className="card-header">
          <h2 className="card-title">Surface Style</h2>
          <p className="card-description">Select the foundational treatment for your widget.</p>
        </div>
        
        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {SURFACE_STYLES.map((styleObj) => {
              // Mini preview generator
              const miniConfig = { ...DEFAULT_APPEARANCE_CONFIGS[styleObj.id] };
              const miniStyles = computeWidgetStyles(miniConfig);
              
              return (
                <button
                  key={styleObj.id}
                  type="button"
                  onClick={() => setSurfaceStyle(styleObj.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: theme.surface_style === styleObj.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: theme.surface_style === styleObj.id ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' : 'var(--bg-base)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '60px',
                    position: 'relative',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Mini Widget Component */}
                    <div style={{
                      ...miniStyles.containerStyles,
                      transform: 'scale(0.85)',
                      padding: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      <div style={miniStyles.bgStyles} />
                      <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: miniConfig.text_color }} />
                        <span style={{ fontSize: '14px', color: miniConfig.text_color, fontWeight: 600 }}>Preview</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: theme.surface_style === styleObj.id ? 600 : 500 }}>
                    {styleObj.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-header" style={{ marginTop: '32px' }}>
          <h2 className="card-title">Customisation</h2>
        </div>

        <div className="card-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s-8)', alignItems: 'start' }}>
          {/* Colors & Fonts */}
          <div style={{ background: 'var(--bg-muted)', padding: 'var(--s-6)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--s-5)' }}>Colors & Typography</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-4)' }}>
              <div className="input-group">
                <label className="input-label">Background</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" name="bg_color" value={theme.bg_color} onChange={handleChange} style={{ width: '32px', height: '32px', padding: 0, border: 'none' }} />
                  <input type="text" className="input" name="bg_color" value={theme.bg_color} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Text</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" name="text_color" value={theme.text_color} onChange={handleChange} style={{ width: '32px', height: '32px', padding: 0, border: 'none' }} />
                  <input type="text" className="input" name="text_color" value={theme.text_color} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Background Opacity: {theme.bg_opacity}%</label>
                <input type="range" name="bg_opacity" min="0" max="100" step="1" value={theme.bg_opacity} onChange={handleChange} style={{ width: '100%' }} />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Font Family</label>
                <select name="font_family" className="input" value={theme.font_family} onChange={handleChange}>
                  <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                  <option value="'Roboto', sans-serif">Roboto (Clean Sans)</option>
                  <option value="'Outfit', sans-serif">Outfit (Geometric Sans)</option>
                  <option value="Georgia, serif">Georgia (Classic Serif)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Elegant Serif)</option>
                  <option value="monospace">Courier (Monospace)</option>
                  <option value="'Oswald', sans-serif">Oswald (Bold Condensed)</option>
                </select>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Border Radius: {theme.border_radius}px</label>
                <input type="range" name="border_radius" min="0" max="40" step="2" value={theme.border_radius} onChange={handleChange} style={{ width: '100%' }} />
              </div>
              
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Border Width: {theme.border_width}px</label>
                <input type="range" name="border_width" min="0" max="10" step="1" value={theme.border_width} onChange={handleChange} style={{ width: '100%' }} />
              </div>

              {theme.border_width > 0 && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Border Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" name="border_color" value={theme.border_color} onChange={handleChange} style={{ width: '32px', height: '32px', padding: 0, border: 'none' }} />
                    <input type="text" className="input" name="border_color" value={theme.border_color} onChange={handleChange} />
                  </div>
                </div>
              )}

              <div className="input-group" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name="show_product_image" 
                    checked={theme.show_product_image} 
                    onChange={(e) => setTheme((prev: any) => ({ ...prev, show_product_image: e.target.checked }))} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  Enable Product Pictures in Notifications
                </label>
              </div>

              {theme.show_product_image && (
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Image Roundness: {theme.image_roundness}%</label>
                  <input type="range" name="image_roundness" min="0" max="50" step="1" value={theme.image_roundness} onChange={handleChange} style={{ width: '100%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Conditional Styles & Behaviors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
            
            {(theme.surface_style === 'glassmorphism' || ['grain', 'paper', 'linen', 'y2k'].includes(theme.surface_style)) && (
              <div style={{ background: 'var(--bg-muted)', padding: 'var(--s-6)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--s-5)' }}>Style Specifics</h3>
                
                {theme.surface_style === 'glassmorphism' && (
                  <div className="input-group">
                    <label className="input-label">Blur Intensity: {theme.blur_intensity}px</label>
                    <input type="range" name="blur_intensity" min="0" max="40" step="1" value={theme.blur_intensity} onChange={handleChange} style={{ width: '100%' }} />
                  </div>
                )}

                {['grain', 'paper', 'linen'].includes(theme.surface_style) && (
                  <div className="input-group">
                    <label className="input-label">Texture Intensity: {theme.texture_intensity}%</label>
                    <input type="range" name="texture_intensity" min="0" max="100" step="5" value={theme.texture_intensity} onChange={handleChange} style={{ width: '100%' }} />
                  </div>
                )}

                {theme.surface_style === 'y2k' && (
                  <div className="input-group">
                    <label className="input-label">Sheen Color</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="color" name="sheen_color" value={theme.sheen_color} onChange={handleChange} style={{ width: '32px', height: '32px', padding: 0, border: 'none' }} />
                      <input type="text" className="input" name="sheen_color" value={theme.sheen_color} onChange={handleChange} />
                    </div>
                  </div>
                )}
              </div>
            )}

            
            <div style={{ background: 'var(--bg-muted)', padding: 'var(--s-6)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--s-5)' }}>Behavior & Layout</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
                {/* Hover Animation Picker */}
                <div className="input-group">
                  <label className="input-label">Hover Animation</label>
                  <input type="hidden" name="hover_animation" value={theme.hover_animation} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {HOVER_ANIMATIONS.map((anim) => (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setTheme((prev: any) => ({ ...prev, hover_animation: anim.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.hover_animation === anim.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: theme.hover_animation === anim.id ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' : 'var(--bg-base)',
                          color: theme.hover_animation === anim.id ? 'var(--primary)' : 'var(--text-secondary)',
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
                        onClick={() => setTheme((prev: any) => ({ ...prev, size: s.id }))}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.size === s.id 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          background: theme.size === s.id 
                            ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                            : 'var(--bg-base)',
                          color: theme.size === s.id 
                            ? 'var(--primary)' 
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
                        onClick={() => setTheme((prev: any) => ({ ...prev, position: pos.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.position === pos.id 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          background: theme.position === pos.id 
                            ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                            : 'var(--bg-base)',
                          color: theme.position === pos.id 
                            ? 'var(--primary)' 
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
                        onClick={() => setTheme((prev: any) => ({ ...prev, slide_animation: anim.id }))}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: theme.slide_animation === anim.id 
                            ? '2px solid var(--primary)' 
                            : '1px solid var(--border)',
                          background: theme.slide_animation === anim.id 
                            ? 'var(--bg-accent-light, rgba(99, 102, 241, 0.08))' 
                            : 'var(--bg-base)',
                          color: theme.slide_animation === anim.id 
                            ? 'var(--primary)' 
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
</div>
          </div>
        </div>

        <div className="card-footer">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Appearance'}
          </button>
        </div>
      </form>
    </div>
  );
}
