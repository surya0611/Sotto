'use client';

import { useState, useTransition } from 'react';
import { AdvancedRule, RuleCondition, RuleAction } from '@/types';
import { saveRules } from './actions';

export function RulesClient({ initialRules }: { initialRules: AdvancedRule[] }) {
  const [isPending, startTransition] = useTransition();
  const [rules, setRules] = useState<AdvancedRule[]>(initialRules);

  const addRule = () => {
    const newRule: AdvancedRule = {
      id: crypto.randomUUID(),
      title: 'New Rule',
      description: '',
      is_active: true,
      conditions: [{ variable: 'url_path', operator: 'contains', value: '' }],
      action: { setting: 'do_not_show_template', value: 'true' }
    };
    setRules([...rules, newRule]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof AdvancedRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const addCondition = (ruleIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions.push({ variable: 'url_path', operator: 'contains', value: '' });
    setRules(newRules);
  };

  const updateCondition = (ruleIndex: number, condIndex: number, field: keyof RuleCondition, value: string) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions[condIndex] = { ...newRules[ruleIndex].conditions[condIndex], [field]: value };
    setRules(newRules);
  };

  const removeCondition = (ruleIndex: number, condIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions.splice(condIndex, 1);
    setRules(newRules);
  };

  const updateAction = (ruleIndex: number, field: keyof RuleAction, value: string) => {
    const newRules = [...rules];
    newRules[ruleIndex].action = { ...newRules[ruleIndex].action, [field]: value };
    setRules(newRules);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveRules(rules);
        alert('Rules saved successfully!');
      } catch (e: any) {
        alert('Failed to save rules: ' + e.message);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
      {rules.map((rule, ruleIndex) => (
        <div key={rule.id} className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className="input"
                style={{ fontSize: '1.25rem', fontWeight: 600, border: 'none', background: 'transparent', padding: '0', marginBottom: 'var(--s-2)' }}
                value={rule.title}
                onChange={(e) => updateRule(ruleIndex, 'title', e.target.value)}
                placeholder="Rule Title"
              />
              <input
                type="text"
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '0', color: 'var(--text-muted)', width: '100%' }}
                value={rule.description}
                onChange={(e) => updateRule(ruleIndex, 'description', e.target.value)}
                placeholder="Description: Example Checkout Page"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', fontSize: '0.9375rem' }}>
                <input 
                  type="checkbox" 
                  checked={rule.is_active} 
                  onChange={(e) => updateRule(ruleIndex, 'is_active', e.target.checked)} 
                /> Active
              </label>
              <button 
                onClick={() => removeRule(ruleIndex)}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--destructive)' }}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
            
            {/* Conditions Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-3)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Conditions</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => addCondition(ruleIndex)}>
                  Add Condition
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                {rule.conditions.map((cond, condIndex) => (
                  <div key={condIndex} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', background: 'var(--bg-surface)', padding: 'var(--s-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                    <div style={{ background: 'var(--bg-muted)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                      {condIndex === 0 ? 'If...' : 'And...'}
                    </div>
                    
                    <select 
                      className="input" 
                      value={cond.variable} 
                      onChange={(e) => updateCondition(ruleIndex, condIndex, 'variable', e.target.value)}
                      style={{ width: '180px' }}
                    >
                      <option value="url_path">URL Path</option>
                      <option value="url_host">URL Host</option>
                      <option value="url_parameter">URL Parameter</option>
                      <option value="home_page">Home page</option>
                      <option value="mobile_browser">Mobile Browser</option>
                    </select>

                    <select 
                      className="input" 
                      value={cond.operator} 
                      onChange={(e) => updateCondition(ruleIndex, condIndex, 'operator', e.target.value)}
                      style={{ width: '150px' }}
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equal</option>
                      <option value="contains">Contains</option>
                      <option value="does_not_contain">Does Not Contain</option>
                      <option value="begins_with">Begins With</option>
                    </select>

                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Value" 
                      value={cond.value} 
                      onChange={(e) => updateCondition(ruleIndex, condIndex, 'value', e.target.value)}
                      style={{ flex: 1 }}
                    />

                    {rule.conditions.length > 1 && (
                      <button onClick={() => removeCondition(ruleIndex, condIndex)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--s-4)', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                If all conditions are met, apply this rule
                <br/>↓
              </div>
            </div>

            {/* Rule Action Section */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 var(--s-3) 0' }}>Rule</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', background: 'var(--bg-surface)', padding: 'var(--s-4)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <select 
                  className="input" 
                  value={rule.action.setting} 
                  onChange={(e) => updateAction(ruleIndex, 'setting', e.target.value)}
                  style={{ width: '300px' }}
                >
                  <option value="do_not_show_template">Do Not Show Widget</option>
                  <option value="max_per_page">Change Max Per Page</option>
                  <option value="initial_delay">Change Initial Delay (ms)</option>
                  <option value="display_interval">Change Display Interval (ms)</option>
                  <option value="position">Change Position</option>
                </select>

                {rule.action.setting === 'position' ? (
                  <select 
                    className="input" 
                    value={rule.action.value as string} 
                    onChange={(e) => updateAction(ruleIndex, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                  </select>
                ) : rule.action.setting === 'do_not_show_template' ? (
                  <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                    Widget will be hidden when conditions are met.
                  </div>
                ) : (
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Value (e.g. 5000 for ms)" 
                    value={rule.action.value as string} 
                    onChange={(e) => updateAction(ruleIndex, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s-4)', padding: 'var(--s-6) 0' }}>
        <button className="btn btn-outline" onClick={addRule} style={{ width: '200px' }}>
          + Add New Rule
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={isPending} style={{ width: '200px' }}>
          {isPending ? 'Saving...' : 'Save All Rules'}
        </button>
      </div>

      {rules.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s-8)' }}>
          No rules defined. Create one above to get started.
        </div>
      )}
    </div>
  );
}
