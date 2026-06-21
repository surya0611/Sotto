'use client';

import { useTransition, useState } from 'react';
import { updateWidgetConfig } from './actions';
import { WidgetConfig } from '@/types';

export function WidgetForm({ initialConfig }: { initialConfig: Partial<WidgetConfig> }) {
  const [isPending, startTransition] = useTransition();
  const [timeBetween, setTimeBetween] = useState(initialConfig.timing?.time_between_ms || 8000);
  const [conversionRules, setConversionRules] = useState(initialConfig.conversion_rules || []);
  const [pageRules, setPageRules] = useState(initialConfig.page_rules || []);

  const addPageRule = () => {
    setPageRules([...pageRules, { type: 'include', pattern: '' }]);
  };

  const removePageRule = (index: number) => {
    setPageRules(pageRules.filter((_, i) => i !== index));
  };

  const updatePageRule = (index: number, field: 'type' | 'pattern', value: string) => {
    const newRules = [...pageRules];
    if (field === 'type') {
      newRules[index].type = value as 'include' | 'exclude';
    } else {
      newRules[index].pattern = value;
    }
    setPageRules(newRules);
  };

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
        <div className="card-header">
          <h2 className="card-title">Widget Behavior</h2>
          <p className="card-description">Configure how the social proof widget is displayed to your visitors.</p>
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
      </div>

      {/* Timing Controls */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Timing</h2>
          <p className="card-description">Control the display timing of the widget.</p>
        </div>

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
        <div className="card-header">
          <h2 className="card-title">Visibility</h2>
          <p className="card-description">Control where the widget is shown.</p>
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
      </div>

      {/* Page Display Rules */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Page Display Rules</h2>
          <p className="card-description">Control which pages the widget is allowed to show on using simple wildcard patterns (e.g. <code>*/checkout/*</code>).</p>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {pageRules.map((rule, index) => (
            <div key={index} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <select 
                name="page_rule_type" 
                className="input" 
                value={rule.type}
                onChange={(e) => updatePageRule(index, 'type', e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>
              <input 
                type="text" 
                name="page_rule_pattern" 
                className="input" 
                placeholder="*/login*" 
                value={rule.pattern}
                onChange={(e) => updatePageRule(index, 'pattern', e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => removePageRule(index)}
                style={{ padding: 'var(--space-2)', color: 'var(--error)' }}
              >
                Delete
              </button>
            </div>
          ))}
          
          <button type="button" className="btn btn-secondary btn-sm" onClick={addPageRule} style={{ alignSelf: 'flex-start' }}>
            + Add Page Rule
          </button>
        </div>
      </div>

      {/* Conversion Rules */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Conversion Tracking Rules</h2>
          <p className="card-description">Define which pages count as a conversion (e.g. thank you page).</p>
        </div>

        <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
      </div>

      <div style={{ position: 'sticky', bottom: 'var(--space-4)', alignSelf: 'flex-end', zIndex: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}
