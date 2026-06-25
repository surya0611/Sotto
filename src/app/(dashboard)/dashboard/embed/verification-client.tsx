'use client';

import { useState, useEffect } from 'react';

export function VerificationClient({ initialIsInstalled }: { initialIsInstalled: boolean }) {
  const [isInstalled, setIsInstalled] = useState(initialIsInstalled);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isInstalled) return;

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/accounts/status');
        if (res.ok) {
          const data = await res.json();
          if (data.is_installed) {
            setIsInstalled(true);
            setError(false);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };

    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [isInstalled]);

  if (isInstalled) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--success-bg)',
        border: '1px solid var(--success)',
        color: 'var(--success)',
        padding: '16px 20px',
        borderRadius: 'var(--r-md)',
        fontWeight: 600,
        fontSize: '0.9375rem',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 10 0 1-5.93 9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Successfully Installed! Your widget is connected and receiving data.
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'var(--bg-muted)',
      border: '1px dashed var(--border)',
      color: 'var(--text-muted)',
      padding: '16px 20px',
      borderRadius: 'var(--r-md)',
      fontWeight: 500,
      fontSize: '0.9375rem',
    }}>
      <div style={{ 
        width: '16px', 
        height: '16px', 
        border: '2px solid var(--border)', 
        borderTopColor: 'var(--primary)', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      Waiting for widget connection...
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
