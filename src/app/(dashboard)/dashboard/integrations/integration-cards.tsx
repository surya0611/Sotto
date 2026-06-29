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
  defaultIcon: React.ReactNode;
  secretKeyLabel: string;
  placeholder: string;
}

function IntegrationIcon({ id, defaultIcon }: { id: string; defaultIcon: React.ReactNode }) {
  const [error, setError] = useState(false);
  
  const simpleIcons = ['shopify', 'razorpay', 'typeform', 'magento', 'bigcommerce', 'squarespace', 'woocommerce', 'stripe', 'bigcartel'];
  const slugMap: Record<string, string> = {
    'google_forms': 'google'
  };
  
  const src = simpleIcons.includes(id) || slugMap[id] 
    ? `https://cdn.simpleicons.org/${slugMap[id] || id}` 
    : `/logos/${id}.svg`;
    
  if (error) return <>{defaultIcon}</>;
  
  return (
    <img 
      src={src} 
      alt={id} 
      width="36" 
      height="36" 
      onError={() => setError(true)} 
      style={{ objectFit: 'contain', width: '36px', height: '36px' }} 
    />
  );
}

const INTEGRATIONS: Integration[] = [
  { 
    id: 'shopify', 
    name: 'Shopify', 
    description: 'Capture purchase events from your Shopify store', 
    category: 'E-commerce',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    secretKeyLabel: 'Shopify Webhook HMAC Secret',
    placeholder: 'hsq_...'
  },
  { 
    id: 'cratejoy', 
    name: 'Cratejoy', 
    description: 'Capture subscription events from Cratejoy', 
    category: 'E-commerce',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
    secretKeyLabel: 'Cratejoy Webhook Secret',
    placeholder: 'Enter your Cratejoy secret'
  },
  { 
    id: 'razorpay', 
    name: 'Razorpay', 
    description: 'Track successful payments via Razorpay', 
    category: 'Payments',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
    secretKeyLabel: 'Razorpay Webhook Secret',
    placeholder: 'sk_test_...'
  },
  { 
    id: 'easebuzz', 
    name: 'Easebuzz', 
    description: 'Track successful payments via Easebuzz', 
    category: 'Payments',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    secretKeyLabel: 'Easebuzz Salt',
    placeholder: 'Enter your merchant salt'
  },
  { 
    id: 'typeform', 
    name: 'Typeform', 
    description: 'Capture form submissions from Typeform', 
    category: 'Forms',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
    secretKeyLabel: 'Typeform Webhook Secret',
    placeholder: 'tf_...'
  },
  { 
    id: 'google_forms', 
    name: 'Google Forms', 
    description: 'Receive submissions from Google Forms', 
    category: 'Forms',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    secretKeyLabel: 'Sotto Secret (Custom Header)',
    placeholder: 'Enter a secure random string'
  },
  { 
    id: 'custom', 
    name: 'Custom Webhook', 
    description: 'Connect Zapier, Make.com, or custom APIs', 
    category: 'Custom',
    defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>,
    secretKeyLabel: 'Sotto Authorization Secret',
    placeholder: 'Enter a secure token to authenticate requests'
  },
  { id: '3dcart', name: '3dcart (Shift4Shop)', description: 'Capture events from 3dcart', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'magento', name: 'Magento', description: 'Capture events from Magento', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2V14h8v8h2a2 2 0 0 0 2-2v-8"/><path d="M2 7h20v2a3 3 0 0 1-3 3 3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-3-3V7Z"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'lightspeed', name: 'LightSpeed', description: 'Capture events from LightSpeed', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'bigcommerce', name: 'BigCommerce', description: 'Capture events from BigCommerce', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'ecwid', name: 'Ecwid', description: 'Capture events from Ecwid', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'thrivecart', name: 'ThriveCart', description: 'Capture events from ThriveCart', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'squarespace', name: 'Squarespace', description: 'Capture events from Squarespace', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'jumpseller', name: 'Jumpseller', description: 'Capture events from Jumpseller', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'bigcartel', name: 'Big Cartel', description: 'Capture events from Big Cartel', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, secretKeyLabel: 'Webhook Secret', placeholder: 'Enter your webhook secret' },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Capture events from WordPress WooCommerce', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2V14h8v8h2a2 2 0 0 0 2-2v-8"/><path d="M2 7h20v2a3 3 0 0 1-3 3 3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-3-3V7Z"/></svg>, secretKeyLabel: 'WooCommerce Secret', placeholder: 'Enter your WooCommerce webhook secret' },
  { id: 'instamojo', name: 'Instamojo', description: 'Track successful payments via Instamojo', category: 'Payments', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>, secretKeyLabel: 'Instamojo Webhook Secret', placeholder: 'Enter your Instamojo secret' },
  { id: 'cashfree', name: 'Cashfree', description: 'Track successful payments via Cashfree', category: 'Payments', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3c3.1 0 5-2.5 5-5s-2-5-5-5"/></svg>, secretKeyLabel: 'Cashfree Webhook Secret', placeholder: 'Enter your Cashfree secret' },
  { id: 'payu', name: 'PayU', description: 'Track successful payments via PayU', category: 'Payments', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>, secretKeyLabel: 'PayU Webhook Secret', placeholder: 'Enter your PayU secret' },
  { id: 'dukaan', name: 'Dukaan', description: 'Capture events from Dukaan', category: 'E-commerce', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2V14h8v8h2a2 2 0 0 0 2-2v-8"/><path d="M2 7h20v2a3 3 0 0 1-3 3 3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-3-3V7Z"/></svg>, secretKeyLabel: 'Dukaan Webhook Secret', placeholder: 'Enter your Dukaan secret' },
  { id: 'stripe', name: 'Stripe', description: 'Track successful payments via Stripe', category: 'Payments', defaultIcon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 6.94C22 5.31 20.67 4 19 4H5C3.33 4 2 5.31 2 6.94v10.12C2 18.69 3.33 20 5 20h14c1.67 0 3-1.31 3-2.94V6.94Z"/><path d="M2 10h20"/></svg>, secretKeyLabel: 'Stripe Webhook Secret', placeholder: 'whsec_...' }
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

  const big9 = ['shopify', 'stripe', 'razorpay', 'woocommerce', 'magento', 'bigcommerce', 'squarespace', 'typeform', 'google_forms'];

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesCategory = activeCategory === 'All' || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const aIndex = big9.indexOf(a.id);
    const bIndex = big9.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
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
                  <IntegrationIcon id={integration.id} defaultIcon={integration.defaultIcon} />
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
