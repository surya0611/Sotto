import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Security Check: Ensure user is logged in
  if (!user) {
    redirect('/login');
  }

  // Security Check: Ensure user is the Super Admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    // If not admin, bounce them back to the brand dashboard
    redirect('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-deep)' }}>
      {/* Admin Topbar */}
      <header style={{
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        padding: '0 var(--space-6)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div className="sidebar-logo-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>S</div>
          <span style={{ fontWeight: 600, letterSpacing: '-0.5px' }}>Sotto Super Admin</span>
        </div>
        <nav style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Brand Dashboard
          </Link>
        </nav>
      </header>

      {/* Admin Content Area */}
      <main style={{ flex: 1, padding: 'var(--space-8)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
