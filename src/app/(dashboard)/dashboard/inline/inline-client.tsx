'use client';

import { useTransition, useState } from 'react';
import { saveInlineConfig } from './actions';
import { CopyButton } from '@/components/copy-button';

export function InlineClient({ initialConfig }: { initialConfig: any }) {
  const [isPending, startTransition] = useTransition();

  const [activeVisitorsEnabled, setActiveVisitorsEnabled] = useState(initialConfig.active_visitors_enabled ?? true);
  const [activeVisitorsText, setActiveVisitorsText] = useState(initialConfig.active_visitors_text || '{{count}} people are currently viewing this page');

  const [pageStreamEnabled, setPageStreamEnabled] = useState(initialConfig.page_stream_enabled ?? true);
  const [pageStreamText, setPageStreamText] = useState(initialConfig.page_stream_text || '{{count}} people bought this in the last 24 hours');

  const [customRoundupsEnabled, setCustomRoundupsEnabled] = useState(initialConfig.custom_roundups_enabled ?? true);
  const [customRoundupsText, setCustomRoundupsText] = useState(initialConfig.custom_roundups_text || '{{count}} people subscribed recently');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (activeVisitorsEnabled) formData.append('active_visitors_enabled', 'on');
    formData.append('active_visitors_text', activeVisitorsText);
    if (pageStreamEnabled) formData.append('page_stream_enabled', 'on');
    formData.append('page_stream_text', pageStreamText);
    if (customRoundupsEnabled) formData.append('custom_roundups_enabled', 'on');
    formData.append('custom_roundups_text', customRoundupsText);

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

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Embed Code</label>
            <CopyButton textToCopy={`<span data-sotto-inline="${dataId}"></span>`} />
          </div>
          <code style={{ 
            display: 'block', 
            background: 'var(--bg-base)', 
            padding: 'var(--space-3)', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            &lt;span data-sotto-inline="{dataId}"&gt;&lt;/span&gt;
          </code>
          <p className="input-hint">Paste this code anywhere on your website (e.g. below the Add to Cart button). The Sotto script will automatically replace it with your Display Text.</p>
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      )}

      {renderCard(
        'Page Stream',
        'Show off the sales of a product over a 24 hour period.',
        'page-stream',
        pageStreamEnabled, setPageStreamEnabled,
        pageStreamText, setPageStreamText,
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      )}

      {renderCard(
        'Custom Roundups',
        'Show off the aggregate count of behaviors like subscriptions, reviews, etc.',
        'custom-roundups',
        customRoundupsEnabled, setCustomRoundupsEnabled,
        customRoundupsText, setCustomRoundupsText,
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
