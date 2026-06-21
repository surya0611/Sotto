'use client';

import { useTransition, useState } from 'react';
import { saveInlineConfig } from './actions';
import { CopyButton } from '@/components/copy-button';

export function InlineClient({ initialConfig }: { initialConfig: any }) {
  const [isPending, startTransition] = useTransition();

  const [activeVisitorsEnabled, setActiveVisitorsEnabled] = useState(initialConfig.active_visitors_enabled ?? true);
  const [activeVisitorsMode, setActiveVisitorsMode] = useState(initialConfig.active_visitors_mode || 'simulated');
  const [activeVisitorsText, setActiveVisitorsText] = useState(initialConfig.active_visitors_text || '{{count}} people are currently viewing this page');
  const [activeVisitorsColor, setActiveVisitorsColor] = useState(initialConfig.active_visitors_color || 'inherit');
  const [activeVisitorsSize, setActiveVisitorsSize] = useState(initialConfig.active_visitors_size || 'inherit');
  const [activeVisitorsIcon, setActiveVisitorsIcon] = useState(initialConfig.active_visitors_icon || 'none');

  const [pageStreamEnabled, setPageStreamEnabled] = useState(initialConfig.page_stream_enabled ?? true);
  const [pageStreamText, setPageStreamText] = useState(initialConfig.page_stream_text || '{{count}} people bought this in the last 24 hours');
  const [pageStreamColor, setPageStreamColor] = useState(initialConfig.page_stream_color || 'inherit');
  const [pageStreamSize, setPageStreamSize] = useState(initialConfig.page_stream_size || 'inherit');
  const [pageStreamIcon, setPageStreamIcon] = useState(initialConfig.page_stream_icon || 'none');

  const [customRoundupsEnabled, setCustomRoundupsEnabled] = useState(initialConfig.custom_roundups_enabled ?? true);
  const [customRoundupsText, setCustomRoundupsText] = useState(initialConfig.custom_roundups_text || '{{count}} people subscribed recently');
  const [customRoundupsColor, setCustomRoundupsColor] = useState(initialConfig.custom_roundups_color || 'inherit');
  const [customRoundupsSize, setCustomRoundupsSize] = useState(initialConfig.custom_roundups_size || 'inherit');
  const [customRoundupsIcon, setCustomRoundupsIcon] = useState(initialConfig.custom_roundups_icon || 'none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (activeVisitorsEnabled) formData.append('active_visitors_enabled', 'on');
    formData.append('active_visitors_mode', activeVisitorsMode);
    formData.append('active_visitors_text', activeVisitorsText);
    formData.append('active_visitors_color', activeVisitorsColor);
    formData.append('active_visitors_size', activeVisitorsSize);
    formData.append('active_visitors_icon', activeVisitorsIcon);

    if (pageStreamEnabled) formData.append('page_stream_enabled', 'on');
    formData.append('page_stream_text', pageStreamText);
    formData.append('page_stream_color', pageStreamColor);
    formData.append('page_stream_size', pageStreamSize);
    formData.append('page_stream_icon', pageStreamIcon);

    if (customRoundupsEnabled) formData.append('custom_roundups_enabled', 'on');
    formData.append('custom_roundups_text', customRoundupsText);
    formData.append('custom_roundups_color', customRoundupsColor);
    formData.append('custom_roundups_size', customRoundupsSize);
    formData.append('custom_roundups_icon', customRoundupsIcon);

    startTransition(async () => {
      try {
        await saveInlineConfig(formData);
        alert('Inline settings saved successfully!');
      } catch (err: any) {
        alert('Failed to save inline settings: ' + err.message);
      }
    });
  };

  const renderCard = (
    title: string, 
    description: string, 
    dataId: string, 
    enabled: boolean, 
    setEnabled: (val: boolean) => void, 
    text: string, 
    setText: (val: string) => void,
    color: string,
    setColor: (val: string) => void,
    size: string,
    setSize: (val: string) => void,
    iconSetting: string,
    setIconSetting: (val: string) => void,
    icon: React.ReactNode
  ) => (
    <div className="card" style={{ borderLeft: enabled ? '4px solid var(--accent)' : '4px solid var(--border)', transition: 'all 0.2s' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', background: 'var(--bg-elevated)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            {icon}
          </div>
          <div>
            <h2 className="card-title" style={{ margin: 0, fontSize: '1.125rem' }}>{title}</h2>
            <p className="card-description" style={{ margin: 0 }}>{description}</p>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
          /> 
          Enabled
        </label>
      </div>

      <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
        
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <div style={{ background: 'var(--accent)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-text)', flexShrink: 0 }}>
            1
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Design your module</h3>
        </div>

        {dataId === 'active-visitors' && (
          <div className="input-group">
            <label className="input-label">Algorithm Mode</label>
            <select 
              className="input" 
              value={activeVisitorsMode} 
              onChange={(e) => setActiveVisitorsMode(e.target.value)}
            >
              <option value="simulated">Smart Algorithm (Highly Realistic, High Conversion)</option>
              <option value="true_live">True Live Metric (Exact Session Count)</option>
            </select>
            <p className="input-hint">
              {activeVisitorsMode === 'simulated' 
                ? 'We use a smart hashing algorithm to ensure your store never looks "dead" by showing 0 or 1 visitors.'
                : 'We will show the exact number of active sessions in the last 15 minutes. Warning: Can cause negative social proof if traffic is low.'}
            </p>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Display Text</label>
          <input 
            type="text" 
            className="input" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`e.g., There are currently {{count}} shoppers online`}
          />
          <p className="input-hint">Use <code>{`{{count}}`}</code> to display the dynamic number.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="input-label">Text Color</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input 
                type="color" 
                value={color === 'inherit' ? '#000000' : color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
                disabled={color === 'inherit'}
              />
              <select className="input" value={color === 'inherit' ? 'inherit' : 'custom'} onChange={(e) => {
                if (e.target.value === 'inherit') setColor('inherit');
                else setColor('#1a1a1a');
              }}>
                <option value="inherit">Inherit from site</option>
                <option value="custom">Custom Color</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Font Size</label>
            <select className="input" value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="inherit">Inherit</option>
              <option value="12px">Small (12px)</option>
              <option value="14px">Medium (14px)</option>
              <option value="16px">Large (16px)</option>
              <option value="18px">Extra Large (18px)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Visual Indicator</label>
            <select className="input" value={iconSetting} onChange={(e) => setIconSetting(e.target.value)}>
              <option value="none">None</option>
              <option value="pulse_green">🟢 Blinking Green Dot</option>
              <option value="pulse_red">🔴 Blinking Red Dot</option>
              <option value="fire">🔥 Fire Emoji</option>
              <option value="eyes">👀 Eyes Emoji</option>
              <option value="bag">🛍️ Shopping Bag</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--space-6) 0' }} />

        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ background: 'var(--accent)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-text)', flexShrink: 0 }}>
            2
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Install the Embed Code</h3>
        </div>

        <div className="input-group" style={{ background: 'var(--bg-base)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Embed Code</label>
            <CopyButton textToCopy={`<span data-sotto-inline="${dataId}"></span>`} />
          </div>
          </div>
          <pre style={{ 
            display: 'block', 
            background: 'var(--bg-deep)', 
            padding: 'var(--space-4)', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            overflowX: 'auto'
          }}>
            <code>&lt;span data-sotto-inline="{dataId}"&gt;&lt;/span&gt;</code>
          </pre>
          <p className="input-hint" style={{ marginTop: 'var(--space-2)' }}>Paste this HTML snippet into your website builder (Shopify, Webflow, etc) exactly where you want the text to appear.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px' }}>
      
      {renderCard(
        'Active Visitors',
        'Show off the number of visitors currently active on your pages.',
        'active-visitors',
        activeVisitorsEnabled, setActiveVisitorsEnabled,
        activeVisitorsText, setActiveVisitorsText,
        activeVisitorsColor, setActiveVisitorsColor,
        activeVisitorsSize, setActiveVisitorsSize,
        activeVisitorsIcon, setActiveVisitorsIcon,
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      )}

      {renderCard(
        'Page Stream',
        'Show off the sales of a product over a 24 hour period.',
        'page-stream',
        pageStreamEnabled, setPageStreamEnabled,
        pageStreamText, setPageStreamText,
        pageStreamColor, setPageStreamColor,
        pageStreamSize, setPageStreamSize,
        pageStreamIcon, setPageStreamIcon,
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      )}

      {renderCard(
        'Custom Roundups',
        'Show off the aggregate count of behaviors like subscriptions, reviews, etc.',
        'custom-roundups',
        customRoundupsEnabled, setCustomRoundupsEnabled,
        customRoundupsText, setCustomRoundupsText,
        customRoundupsColor, setCustomRoundupsColor,
        customRoundupsSize, setCustomRoundupsSize,
        customRoundupsIcon, setCustomRoundupsIcon,
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      )}

      <div style={{ position: 'sticky', bottom: 'var(--space-4)', alignSelf: 'flex-end', zIndex: 10, marginTop: 'var(--space-4)' }}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

    </form>
  );
}
