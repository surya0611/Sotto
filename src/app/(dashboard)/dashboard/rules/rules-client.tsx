'use client';

import { useState, useTransition } from 'react';
import { PageRule } from '@/types';
import { saveRules } from './actions';

export function RulesClient({ initialRules }: { initialRules: PageRule[] }) {
  const [isPending, startTransition] = useTransition();
  const [rules, setRules] = useState<PageRule[]>(initialRules);

  const addRule = () => {
    setRules([...rules, { type: 'exclude', pattern: '' }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, key: keyof PageRule, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [key]: value };
    setRules(newRules);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveRules(rules.filter(r => r.pattern.trim() !== ''));
        alert('Rules saved successfully!');
      } catch (e: any) {
        alert('Failed to save rules: ' + e.message);
      }
    });
  };

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="card-title">Conditions & Rules</h2>
          <p className="card-description">If all conditions are met, apply the rule.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={addRule}>
          + Add Condition
        </button>
      </div>

      <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {rules.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8) var(--space-4)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            No rules set. The widget will display on all pages by default.
          </div>
        ) : (
          rules.map((rule, index) => (
            <div key={index} style={{ 
              background: 'var(--bg-elevated)', 
              padding: 'var(--space-5)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              position: 'relative',
              transition: 'all 200ms ease'
            }}>
              <button 
                onClick={() => removeRule(index)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ff5f57'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Remove Rule"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--bg-accent-light)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>IF</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Page URL</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>matches pattern</div>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g., */checkout* or /pricing" 
                  value={rule.pattern}
                  onChange={(e) => updateRule(index, 'pattern', e.target.value)}
                  style={{ flex: 1, minWidth: '250px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>THEN</div>
                <select 
                  className="input" 
                  value={rule.type}
                  onChange={(e) => updateRule(index, 'type', e.target.value as 'include' | 'exclude')}
                  style={{ width: '200px' }}
                >
                  <option value="exclude">Hide Widget</option>
                  <option value="include">Show Widget</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card-footer">
        <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Rules'}
        </button>
      </div>
    </div>
  );
}
