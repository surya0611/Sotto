'use client';

import { useTransition } from 'react';
import { updateWidgetConfig } from './actions';

type WidgetConfig = {
  display_mode?: string;
  aggregate_window?: string;
  frequency_cap?: number;
};

export function WidgetForm({ initialConfig }: { initialConfig: WidgetConfig }) {
  const [isPending, startTransition] = useTransition();

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
    <form action={handleSubmit} className="card">
      <div className="card-header">
        <h2 className="card-title">Widget Behavior</h2>
        <p className="card-description">Configure how and when the social proof widget is displayed to your visitors.</p>
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
          <label htmlFor="aggregate_window" className="input-label">Aggregate Window (if using Aggregate mode)</label>
          <select id="aggregate_window" name="aggregate_window" className="input" defaultValue={initialConfig.aggregate_window || 'day'}>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>

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
          <p className="input-hint">Maximum number of times a widget is shown to a single user per session.</p>
        </div>

      </div>

      <div className="card-footer">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}
