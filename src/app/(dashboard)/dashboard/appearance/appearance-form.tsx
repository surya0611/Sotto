'use client';

import { useTransition, useState } from 'react';
import { updateAppearanceConfig } from './actions';

type ThemeConfig = {
  bg_color?: string;
  text_color?: string;
  font_family?: string;
  border_radius?: string;
};

export function AppearanceForm({ initialTheme }: { initialTheme: ThemeConfig }) {
  const [isPending, startTransition] = useTransition();

  const [theme, setTheme] = useState<ThemeConfig>({
    bg_color: initialTheme.bg_color || '#ffffff',
    text_color: initialTheme.text_color || '#000000',
    font_family: initialTheme.font_family || 'Inter, sans-serif',
    border_radius: initialTheme.border_radius || '8px',
  });

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
      
      <form action={handleSubmit} className="card">
        <div className="card-header">
          <h2 className="card-title">Theme Settings</h2>
          <p className="card-description">Customize the look and feel of the widget.</p>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <div className="input-group">
            <label htmlFor="bg_color" className="input-label">Background Color</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <input 
                type="color" 
                id="bg_color" 
                name="bg_color" 
                value={theme.bg_color} 
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
            <label htmlFor="border_radius" className="input-label">Border Radius</label>
            <input 
              type="text" 
              id="border_radius" 
              name="border_radius" 
              className="input" 
              value={theme.border_radius}
              onChange={handleChange}
              placeholder="e.g., 8px, 0px, 1rem"
            />
          </div>

        </div>

        <div className="card-footer">
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Appearance'}
          </button>
        </div>
      </form>

      <div style={{ position: 'sticky', top: 'calc(var(--topbar-height) + var(--space-6))' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1rem', fontWeight: 600 }}>Live Preview</h3>
        <div 
          style={{
            backgroundColor: theme.bg_color,
            color: theme.text_color,
            fontFamily: theme.font_family,
            borderRadius: theme.border_radius,
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '360px',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'inherit' }}>Someone from New York</p>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.8, color: 'inherit' }}>Just signed up for Sotto Pro</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.6, color: 'inherit' }}>2 minutes ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
