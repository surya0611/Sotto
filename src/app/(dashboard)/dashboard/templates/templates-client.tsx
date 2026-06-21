'use client';

import { useState, useTransition, useRef } from 'react';
import { saveTemplate, deleteTemplate, saveAiSettings } from './actions';
import { NotificationTemplate } from '@/types';

export function TemplatesClient({ templates, initialConfig }: { templates: NotificationTemplate[], initialConfig: any }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('purchase');
  const [templateString, setTemplateString] = useState('');
  const [isActive, setIsActive] = useState(true);

  // AI State
  const [aiEnabled, setAiEnabled] = useState(initialConfig?.ai_copy?.enabled || false);
  const [aiTone, setAiTone] = useState(initialConfig?.ai_copy?.tone || 'professional');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const VARIABLES = [
    { label: 'First Name', value: '{{first_name}}' },
    { label: 'City', value: '{{city}}' },
    { label: 'Province', value: '{{province}}' },
    { label: 'Product Name', value: '{{product_name}}' },
    { label: 'Count (Visitors)', value: '{{count}}' },
    { label: 'Time Ago', value: '{{time_ago}}' },
  ];

  const PRESETS = [
    {
      id: 'preset-sales',
      name: 'Recent Sales',
      event_type: 'purchase',
      template_string: '{{first_name}} in {{city}} just bought {{product_name}}',
      description: 'Show recent purchases to build trust.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    },
    {
      id: 'preset-visitors',
      name: 'Active Visitors',
      event_type: 'active_visitors',
      template_string: '{{count}} people are currently viewing this page',
      description: 'Show live traffic to create urgency.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
    },
    {
      id: 'preset-newsletter',
      name: 'Newsletter Signups',
      event_type: 'signup',
      template_string: 'Someone from {{city}} just subscribed to our newsletter!',
      description: 'Grow your email list faster.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    },
    {
      id: 'preset-custom',
      name: 'Custom Webhook',
      event_type: 'custom',
      template_string: 'Someone just performed an action!',
      description: 'Build your own custom notification.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
    }
  ];

  const handleEdit = (t: NotificationTemplate) => {
    setEditingId(t.id);
    setName(t.name);
    setEventType(t.event_type);
    setTemplateString(t.template_string);
    setIsActive(t.is_active);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setName('');
    setEventType('purchase');
    setTemplateString('{{first_name}} in {{city}} just bought {{product_name}}');
    setIsActive(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setTemplateString(prev => prev + ' ' + variable);
      return;
    }

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    setTemplateString(
      templateString.substring(0, startPos) +
      variable +
      templateString.substring(endPos, templateString.length)
    );

    // Focus and move cursor after variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + variable.length, startPos + variable.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingId) formData.append('id', editingId);
    formData.append('name', name);
    formData.append('event_type', eventType);
    formData.append('template_string', templateString);
    if (isActive) formData.append('is_active', 'on');

    startTransition(async () => {
      try {
        await saveTemplate(formData);
        handleCreateNew();
        alert('Template saved successfully!');
      } catch (err: any) {
        alert('Failed to save template: ' + err.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    startTransition(async () => {
      try {
        await deleteTemplate(id);
      } catch (err: any) {
        alert('Failed to delete template: ' + err.message);
      }
    });
  };

  const handleSaveAi = async () => {
    startTransition(async () => {
      try {
        await saveAiSettings(aiEnabled, aiTone as any);
        alert('AI Copywriter settings saved successfully!');
      } catch (err: any) {
        alert('Failed to save AI settings: ' + err.message);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* AI Copywriter Section */}
      <div className="card" style={{ 
        border: aiEnabled ? '1px solid var(--accent)' : '1px solid var(--border)',
        boxShadow: aiEnabled ? '0 0 40px rgba(99, 102, 241, 0.1)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>NEW</div>
              <h2 className="card-title" style={{ margin: 0, fontSize: '1.25rem' }}>AI-Powered Copywriter</h2>
            </div>
            <p className="card-description" style={{ marginTop: 'var(--space-2)', maxWidth: '600px' }}>
              Let Google Gemini automatically write highly-converting, context-aware psychological copy for your notifications based on the specific product purchased. When enabled, this overrides manual Purchase templates.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem', cursor: 'pointer', background: 'var(--bg-elevated)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
            <input 
              type="checkbox" 
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
            /> 
            <span style={{ fontWeight: 500 }}>{aiEnabled ? 'AI Enabled' : 'AI Disabled'}</span>
          </label>
        </div>

        {aiEnabled && (
          <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <label className="input-label">Copywriting Tone</label>
              <select 
                className="input" 
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
              >
                <option value="professional">Luxury & Professional (e.g. "Just secured by...")</option>
                <option value="urgent">Urgency & FOMO (e.g. "Almost sold out! Purchased by...")</option>
                <option value="playful">Playful with Emojis (e.g. "Just bagged this gem 🔥...")</option>
              </select>
              <p className="input-hint">Changing the tone will clear your cached templates and the AI will rewrite them on the next orders.</p>
            </div>
            
            <div>
              <button onClick={handleSaveAi} className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save AI Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      {/* Template Presets Gallery */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Quick Start Templates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {PRESETS.map(preset => (
            <div 
              key={preset.id}
              className="card"
              onClick={() => {
                setEditingId(null);
                setName(preset.name + ' Template');
                setEventType(preset.event_type);
                setTemplateString(preset.template_string);
                setIsActive(true);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              style={{ cursor: 'pointer', transition: 'all 0.2s', padding: 'var(--space-4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--text-muted)' }}>{preset.icon}</div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '0.875rem', fontWeight: 600 }}>{preset.name}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{preset.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-6)', alignItems: 'start' }}>
      
      {/* Editor Column */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{editingId ? 'Edit Template' : 'Create New Template'}</h2>
          <p className="card-description">Design what your notifications actually say.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="input-group">
            <label className="input-label">Template Name</label>
            <input 
              type="text" 
              className="input" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Shopify Purchase Template"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Event Type</label>
            <select 
              className="input" 
              value={eventType}
              onChange={e => setEventType(e.target.value)}
            >
              <option value="purchase">Purchase (eCommerce)</option>
              <option value="signup">Sign Up (Lead Gen)</option>
              <option value="review">Review / Rating</option>
              <option value="active_visitors">Active Visitors</option>
              <option value="custom">Custom Webhook</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Message Template</label>
            <textarea 
              ref={textareaRef}
              className="input" 
              value={templateString}
              onChange={e => setTemplateString(e.target.value)}
              style={{ height: '100px', resize: 'vertical' }}
              placeholder="Someone just bought {{product_name}}"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Insert Variables</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {VARIABLES.map(v => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => insertVariable(v.value)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              These variables will be automatically replaced with real data from your webhooks.
            </p>
          </div>

          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)' }}>
            <input 
              type="checkbox" 
              id="is_active" 
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
            />
            <label htmlFor="is_active" className="input-label" style={{ margin: 0, cursor: 'pointer' }}>
              Template is Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Saving...' : (editingId ? 'Update Template' : 'Create Template')}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={handleCreateNew}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Column */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Your Templates</h2>
            <p className="card-description">Manage existing templates.</p>
          </div>
          <button onClick={handleCreateNew} className="btn btn-outline btn-sm">
            + New
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {templates.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
              No templates yet. Create one to get started!
            </div>
          ) : (
            templates.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  padding: 'var(--space-4)', 
                  borderBottom: '1px solid var(--border)',
                  background: editingId === t.id ? 'var(--bg-accent-light)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    {t.name}
                    {!t.is_active && <span className="badge badge-outline" style={{ marginLeft: '8px', fontSize: '10px' }}>Inactive</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEdit(t)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      disabled={isPending}
                      style={{ background: 'none', border: 'none', color: '#ff5f57', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Event: <span style={{ textTransform: 'capitalize' }}>{t.event_type}</span>
                </div>
                
                <div style={{ 
                  background: 'var(--bg-elevated)', 
                  padding: '8px 12px', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace'
                }}>
                  {t.template_string}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
    </div>
  );
}
