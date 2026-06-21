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
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-4)' }}>
            No rules set. The widget will display on all pages by default.
          </div>
        ) : (
          rules.map((rule, index) => (
            <div key={index} style={{ 
              background: 'var(--bg-elevated)', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Condition #{index + 1}</span>
                <button 
                  onClick={() => removeRule(index)}
                  style={{ background: 'none', border: 'none', color: '#ff5f57', cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Remove
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div>
                  <select className="input" disabled>
                    <option>If URL</option>
                  </select>
                </div>
                <div>
                  <select className="input" disabled>
                    <option>Matches Pattern</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g., *checkout* or /pricing" 
                    value={rule.pattern}
                    onChange={(e) => updateRule(index, 'pattern', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: 'var(--space-4) 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                ↓
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Then Action:</div>
                <div>
                  <select 
                    className="input" 
                    value={rule.type}
                    onChange={(e) => updateRule(index, 'type', e.target.value as 'include' | 'exclude')}
                  >
                    <option value="exclude">Hide Widget</option>
                    <option value="include">Show Widget</option>
                  </select>
                </div>
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
