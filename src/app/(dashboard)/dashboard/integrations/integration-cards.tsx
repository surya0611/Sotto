'use client';

import { useState } from 'react';
import { saveIntegrationSecret } from './actions';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  secretKeyLabel: string;
  placeholder: string;
}

const INTEGRATIONS: Integration[] = [
  { 
    id: 'shopify', 
    name: 'Shopify', 
    description: 'Capture purchase events from your Shopify store', 
    icon: '🛍',
    secretKeyLabel: 'Shopify Webhook HMAC Secret',
    placeholder: 'hsq_...'
  },
  { 
    id: 'razorpay', 
    name: 'Razorpay', 
    description: 'Track successful payments via Razorpay', 
    icon: '💳',
    secretKeyLabel: 'Razorpay Webhook Secret',
    placeholder: 'sk_test_...'
  },
  { 
    id: 'typeform', 
    name: 'Typeform', 
    description: 'Capture form submissions from Typeform', 
    icon: '📝',
    secretKeyLabel: 'Typeform Webhook Secret',
    placeholder: 'tf_...'
  },
  { 
    id: 'google_forms', 
    name: 'Google Forms', 
    description: 'Receive submissions from Google Forms', 
    icon: '📋',
    secretKeyLabel: 'Sotto Secret (Custom Header)',
    placeholder: 'Enter a secure random string'
  },
  { 
    id: 'easebuzz', 
    name: 'Easebuzz', 
    description: 'Track successful payments via Easebuzz', 
    icon: '⚡',
    secretKeyLabel: 'Easebuzz Salt',
    placeholder: 'Enter your merchant salt'
  },
];

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

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {INTEGRATIONS.map((integration) => {
          const isConnected = !!secrets[`${integration.id}_secret`];
          
          return (
            <div 
              key={integration.id} 
              className="card card-hover" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleOpen(integration.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
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
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                    {integration.name}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
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
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label className="input-label">Webhook URL</label>
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
