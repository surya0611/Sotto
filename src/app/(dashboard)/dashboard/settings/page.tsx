import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and billing</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span style={{ fontSize: '1.5rem' }}>⚙</span>
          </div>
          <h4 className="empty-state-title">Settings coming soon</h4>
          <p className="empty-state-description">
            Account management and billing will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
