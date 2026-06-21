'use client';

import { useTransition, useState } from 'react';
import { updateWidgetConfig } from './actions';
import { WidgetConfig } from '@/types';
import { CopyButton } from '@/components/copy-button';

export function WidgetForm({ initialConfig, accountId }: { initialConfig: Partial<WidgetConfig>, accountId: string }) {
  const [isPending, startTransition] = useTransition();
  const [timeBetween, setTimeBetween] = useState(initialConfig.timing?.time_between_ms || 8000);
  const [conversionRules, setConversionRules] = useState(initialConfig.conversion_rules || []);

  const addConversionRule = () => {
    setConversionRules([...conversionRules, { type: 'url_contains', value: '' }]);
  };

  const removeConversionRule = (index: number) => {
    setConversionRules(conversionRules.filter((_, i) => i !== index));
  };

  const updateConversionRule = (index: number, field: 'type' | 'value', value: string) => {
    const newRules = [...conversionRules];
    if (field === 'type') {
      newRules[index].type = value as 'url_contains' | 'url_equals';
    } else {
      newRules[index].value = value;
    }
    setConversionRules(newRules);
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateWidgetConfig(formData);
        alert('Widget configuration saved successfully.');
      } catch (error: any) {
        alert('Error saving configuration: ' + error.message);
      }
    });
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* General Settings */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
            1
          </div>
          <div>
            <h2 className="card-title">Widget Behavior & Timing</h2>
            <p className="card-description">Configure what the widget shows and how often it pops up.</p>
          </div>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="input-group">
            <label className="input-label">Display Mode</label>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
                <input type="radio" name="display_mode" value="individual" defaultChecked={initialConfig.display_mode !== 'aggregate'} />
                Individual Events
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
                <input type="radio" name="display_mode" value="aggregate" defaultChecked={initialConfig.display_mode === 'aggregate'} />
                Aggregate (e.g., "50 people recently purchased")
              </label>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="aggregate_window" className="input-label">Aggregate Window</label>
            <select id="aggregate_window" name="aggregate_window" className="input" defaultValue={initialConfig.aggregate_window || 'day'}>
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="day">Last 24 Hours</option>
              <option value="3d">Last 3 Days</option>
              <option value="week">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label htmlFor="frequency_cap" className="input-label">Frequency Cap (displays per session)</label>
              <input 
                type="number" 
                id="frequency_cap" 
                name="frequency_cap" 
                className="input" 
                min="1" 
                max="100" 
                defaultValue={initialConfig.frequency_cap || 5} 
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="max_per_page" className="input-label">Max Displays Per Page</label>
              <input 
                type="number" 
                id="max_per_page" 
                name="max_per_page" 
                className="input" 
                min="1" 
                max="100" 
                defaultValue={initialConfig.max_per_page || 20} 
              />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="event_time_threshold" className="input-label">Time-Ago Threshold (Days)</label>
            <input 
              type="number" 
              id="event_time_threshold" 
              name="event_time_threshold" 
              className="input" 
              min="1" 
              max="365" 
              defaultValue={initialConfig.event_time_threshold || 14} 
            />
            <p className="input-hint">Do not display events older than this many days.</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--space-6) 0' }} />

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label htmlFor="delay_ms" className="input-label">Initial Delay (ms)</label>
              <input type="number" id="delay_ms" name="delay_ms" className="input" defaultValue={initialConfig.timing?.delay_ms || 3000} />
              <p className="input-hint">Delay before the first widget appears.</p>
            </div>

            <div className="input-group">
              <label htmlFor="display_ms" className="input-label">Display Duration (ms)</label>
              <input type="number" id="display_ms" name="display_ms" className="input" defaultValue={initialConfig.timing?.display_ms || 4000} />
              <p className="input-hint">How long the widget stays on screen.</p>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="time_between_ms" className="input-label">Time Between Notifications (ms)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <input 
                type="range" 
                id="time_between_ms" 
                name="time_between_ms" 
                min="1000" 
                max="60000" 
                step="1000"
                value={timeBetween}
                onChange={(e) => setTimeBetween(parseInt(e.target.value, 10))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, minWidth: '60px' }}>
                {timeBetween / 1000}s
              </span>
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
              <input type="checkbox" name="loop" defaultChecked={initialConfig.timing?.loop} />
              Loop notifications
            </label>
            <p className="input-hint">When the end of events is reached, start showing them from the beginning again.</p>
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
            2
          </div>
          <div>
            <h2 className="card-title">Visibility & Tracking</h2>
            <p className="card-description">Control where the widget is shown and how it tracks data.</p>
          </div>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
            <input type="checkbox" name="hide_mobile" defaultChecked={initialConfig.visibility?.hide_mobile} />
            Hide on Mobile Devices
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
            <input type="checkbox" name="hide_desktop" defaultChecked={initialConfig.visibility?.hide_desktop} />
            Hide on Desktop Devices
          </label>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--space-6) 0' }} />

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Conversion Tracking Rules</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Define which pages count as a conversion (e.g. thank you page).</p>
          {conversionRules.map((rule, index) => (
            <div key={index} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <select 
                name="conversion_rule_type" 
                className="input" 
                value={rule.type}
                onChange={(e) => updateConversionRule(index, 'type', e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="url_contains">URL contains</option>
                <option value="url_equals">URL equals</option>
              </select>
              <input 
                type="text" 
                name="conversion_rule_value" 
                className="input" 
                placeholder="/checkout/success" 
                value={rule.value}
                onChange={(e) => updateConversionRule(index, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => removeConversionRule(index)}
                style={{ padding: 'var(--space-2)', color: 'var(--error)' }}
              >
                Delete
              </button>
            </div>
          ))}
          
          <button type="button" className="btn btn-secondary btn-sm" onClick={addConversionRule} style={{ alignSelf: 'flex-start' }}>
            + Add Conversion Rule
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--space-6) 0' }} />

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>UTM Tracking</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Automatically append tracking parameters to links inside your notifications.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="utm_enabled" 
                defaultChecked={initialConfig.utm?.enabled} 
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
              /> 
              Enabled
            </label>
          </div>
          <div className="input-group">
            <label htmlFor="utm_source" className="input-label">UTM Source</label>
            <input 
              type="text" 
              id="utm_source" 
              name="utm_source" 
              className="input" 
              placeholder="sotto_widget" 
              defaultValue={initialConfig.utm?.source || 'sotto_widget'} 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="utm_medium" className="input-label">UTM Medium</label>
            <input 
              type="text" 
              id="utm_medium" 
              name="utm_medium" 
              className="input" 
              placeholder="social_proof" 
              defaultValue={initialConfig.utm?.medium || 'social_proof'} 
            />
          </div>

          <div className="input-group">
            <label htmlFor="utm_campaign" className="input-label">UTM Campaign (Optional)</label>
            <input 
              type="text" 
              id="utm_campaign" 
              name="utm_campaign" 
              className="input" 
              placeholder="e.g. black_friday_2026" 
              defaultValue={initialConfig.utm?.campaign || ''} 
            />
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="card-header" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
            3
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="card-title">Install the Embed Code</h2>
            <p className="card-description">Place this script right before the closing <code>&lt;/body&gt;</code> tag on all your website pages.</p>
          </div>
          <CopyButton textToCopy={`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget.js" data-account-id="${accountId}" defer></script>`} />
        </div>

        <div className="card-content">
          <pre style={{ 
            background: 'var(--bg-deep)', 
            padding: 'var(--space-6)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            overflowX: 'auto',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            fontFamily: 'monospace'
          }}>
            <code>{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/widget.js" data-account-id="${accountId}" defer></script>`}</code>
          </pre>
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 'var(--space-4)', alignSelf: 'flex-end', zIndex: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}
