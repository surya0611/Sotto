import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Script from 'next/script';

export const metadata = {
  title: 'Live Demo | Sotto',
};

export default async function DemoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: accountMember } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  const accountId = accountMember?.account_id;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {accountId && (
        <Script 
          src="/widget.js" 
          strategy="afterInteractive" 
          data-account-id={accountId}
        />
      )}

      {/* Modern Navigation */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', color: '#0f172a' }}>
            Aura<span style={{ color: '#3b82f6' }}>.</span>
          </div>
          <div style={{ display: 'flex', gap: '32px', fontSize: '15px', fontWeight: 500, color: '#64748b' }}>
            <span style={{ cursor: 'pointer', color: '#0f172a' }}>Shop</span>
            <span style={{ cursor: 'pointer' }}>Collections</span>
            <span style={{ cursor: 'pointer' }}>About</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
        padding: '120px 24px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(191,219,254,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ background: '#3b82f6', color: 'white', padding: '6px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            New Arrival
          </span>
          <h1 style={{ fontSize: '64px', fontWeight: 800, color: '#0f172a', margin: '24px 0', lineHeight: 1.1, letterSpacing: '-2px' }}>
            Experience Sound <br/> Like Never Before.
          </h1>
          <p style={{ fontSize: '20px', color: '#475569', marginBottom: '40px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 40px' }}>
            Precision-engineered wireless headphones with active noise cancellation and spatial audio.
          </p>
          <button style={{ 
            background: '#0f172a', 
            color: 'white', 
            border: 'none', 
            padding: '18px 40px', 
            borderRadius: '12px', 
            fontSize: '18px', 
            fontWeight: 600, 
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            Shop Now
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '40px', letterSpacing: '-1px' }}>Trending Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
          
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}>
              <div style={{ 
                background: '#f1f5f9', 
                height: '240px', 
                borderRadius: '16px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#cbd5e1'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>Aura Pro Headphones</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Midnight Black</p>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>$299</div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
