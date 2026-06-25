import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', user.id)
      .single();

    if (!membership?.account_id) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('widget_config')
      .eq('id', membership.account_id)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const isInstalled = account.widget_config?.is_installed === true;

    return NextResponse.json({ is_installed: isInstalled });
  } catch (error: any) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
