'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import { OverviewIcon, ListIcon, Zap, WidgetIcon, PaletteIcon, CodeIcon, Eye, SettingsIcon } from '@/components/icons';

interface DashboardShellProps {
  user: {
    email: string;
    name: string;
  };
  account: {
    id: string;
    name: string;
    plan: 'free' | 'boutique' | 'enterprise';
  } | null;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: <OverviewIcon width="16" height="16" /> },
  { label: 'Events', href: '/dashboard/events', icon: <ListIcon width="16" height="16" /> },
  { label: 'Integrations', href: '/dashboard/integrations', icon: <Zap width="16" height="16" /> },
  { label: 'Widget', href: '/dashboard/widget', icon: <WidgetIcon width="16" height="16" /> },
  { label: 'Appearance', href: '/dashboard/appearance', icon: <PaletteIcon width="16" height="16" /> },
  { label: 'Templates', href: '/dashboard/templates', icon: <ListIcon width="16" height="16" /> },
  { label: 'Inline', href: '/dashboard/inline', icon: <ListIcon width="16" height="16" /> },
  { label: 'Rules', href: '/dashboard/rules', icon: <SettingsIcon width="16" height="16" /> },
  { label: 'Embed Code', href: '/dashboard/embed', icon: <CodeIcon width="16" height="16" /> },
  { label: 'Analytics', href: '/dashboard/analytics', icon: <Eye width="16" height="16" /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <SettingsIcon width="16" height="16" /> },
];

export function DashboardShell({ user, account, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const item = NAV_ITEMS.find((item) => isActive(item.href));
    return item?.label || 'Dashboard';
  };

  const planLabels: Record<string, string> = {
    free: 'Free',
    boutique: 'Boutique',
    enterprise: 'Enterprise',
  };

  return (
    <div className="layout-dashboard">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo" style={{ textDecoration: 'none' }}>
            <div className="brand-logo-container" style={{ fontSize: '1.25rem' }}>
              S<img src="/logo.svg" className="brand-logo-icon-inline" alt="o" />TTO
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {NAV_ITEMS.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="sidebar-section-label">Configure</div>
          {NAV_ITEMS.slice(3, 9).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="sidebar-section-label">Insights</div>
          {NAV_ITEMS.slice(9).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm w-full"
            style={{ marginTop: '8px', justifyContent: 'flex-start', paddingLeft: '12px' }}
          >
            ↪ Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="layout-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <h1 className="topbar-title">{getPageTitle()}</h1>
            {account && (
              <span className="badge badge-accent">{planLabels[account.plan] || 'Free'}</span>
            )}
          </div>
          <div className="topbar-right">
            {account && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {account.name}
              </span>
            )}
          </div>
        </header>

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
