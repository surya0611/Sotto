'use client';

import { useState } from 'react';
import { saveIntegrationSecret } from './actions';
import { CopyButton } from '@/components/copy-button';

import React from 'react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  secretKeyLabel: string;
  placeholder: string;
}

const INTEGRATIONS: Integration[] = [
  { 
    id: 'shopify', 
    name: 'Shopify', 
    description: 'Capture purchase events from your Shopify store', 
    category: 'E-commerce',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    secretKeyLabel: 'Shopify Webhook HMAC Secret',
    placeholder: 'hsq_...'
  },
  { 
    id: 'razorpay', 
    name: 'Razorpay', 
    description: 'Track successful payments via Razorpay', 
    category: 'Payments',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
    secretKeyLabel: 'Razorpay Webhook Secret',
    placeholder: 'sk_test_...'
  },
  { 
    id: 'easebuzz', 
    name: 'Easebuzz', 
    description: 'Track successful payments via Easebuzz', 
    category: 'Payments',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    secretKeyLabel: 'Easebuzz Salt',
    placeholder: 'Enter your merchant salt'
  },
  { 
    id: 'typeform', 
    name: 'Typeform', 
    description: 'Capture form submissions from Typeform', 
    category: 'Forms',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
    secretKeyLabel: 'Typeform Webhook Secret',
    placeholder: 'tf_...'
  },
  { 
    id: 'google_forms', 
    name: 'Google Forms', 
    description: 'Receive submissions from Google Forms', 
    category: 'Forms',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    secretKeyLabel: 'Sotto Secret (Custom Header)',
    placeholder: 'Enter a secure random string'
  },
  { 
    id: 'custom', 
    name: 'Custom Webhook', 
    description: 'Connect Zapier, Make.com, or custom APIs', 
    category: 'Custom',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>,
    secretKeyLabel: 'Sotto Authorization Secret',
    placeholder: 'Enter a secure token to authenticate requests'
  },
];

const CATEGORIES = ['All', 'E-commerce', 'Payments', 'Forms', 'Custom'];

export function IntegrationCards({ 
  accountId,
  secrets 
}: { 
  accountId: string;
  secrets: Record<string, string>;
}) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [secretValue, setSecretValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const handleOpen = (id: string) => {
    setSecretValue(secrets[`${id}_secret`] || '');
    setActiveModal(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    
    setLoading(true);
    try {
      await saveIntegrationSecret(activeModal, secretValue);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeIntegration = INTEGRATIONS.find(i => i.id === activeModal);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesCategory = activeCategory === 'All' || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div style={{ display: 'flex', gap: 'var(--s-4)', marginBottom: 'var(--s-6)', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          className="input" 
          placeholder="Search integrations..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '300px' }}
        />
        <div style={{ display: 'flex', gap: 'var(--s-2)', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`badge ${activeCategory === category ? 'badge-primary' : 'badge-default'}`}
              style={{ cursor: 'pointer', border: 'none', background: activeCategory === category ? 'var(--accent-base)' : 'var(--bg-base)' }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--s-4)' }}>
        {filteredIntegrations.map((integration) => {
          const isConnected = !!secrets[`${integration.id}_secret`];
          
          return (
            <div 
              key={integration.id} 
              className="card card-hover" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleOpen(integration.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s-4)' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}>
                  {integration.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--s-1)' }}>
                    {integration.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>
                    {integration.description}
                  </p>
                  {isConnected ? (
                    <span className="badge badge-success">Connected</span>
                  ) : (
                    <span className="badge badge-default">Not connected</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeModal && activeIntegration && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Connect {activeIntegration.name}</h3>
              <button className="toast-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="input-label">Webhook URL</label>
                    <CopyButton textToCopy={`${appUrl}/api/webhooks/${activeIntegration.id}?account_id=${accountId}`} />
                  </div>
                  <input 
                    type="text" 
                    className="input" 
                    readOnly 
                    value={`${appUrl}/api/webhooks/${activeIntegration.id}?account_id=${accountId}`} 
                    style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}
                  />
                  <p className="input-hint">Paste this URL into your {activeIntegration.name} webhook settings.</p>
                </div>

                <div className="input-group">
                  <label className="input-label">{activeIntegration.secretKeyLabel}</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder={activeIntegration.placeholder}
                    value={secretValue}
                    onChange={e => setSecretValue(e.target.value)}
                  />
                  <p className="input-hint">Leave blank to disconnect this integration.</p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
