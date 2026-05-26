import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from './dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the user's account
  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id, role, accounts(id, name, domain, plan)')
    .eq('user_id', user.id)
    .single();

  const account = membership?.accounts as unknown as {
    id: string;
    name: string;
    domain: string | null;
    plan: string;
  } | null;

  return (
    <DashboardShell
      user={{
        email: user.email || '',
        name: user.user_metadata?.brand_name || account?.name || 'User',
      }}
      account={account ? {
        id: account.id,
        name: account.name,
        plan: account.plan as 'free' | 'boutique' | 'enterprise',
      } : null}
    >
      {children}
    </DashboardShell>
  );
}
