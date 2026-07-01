export default function DashboardLoading() {
  return (
    <div className="animate-fade-in stagger-in" style={{ padding: '32px 40px' }}>
      <div className="page-header">
        <div style={{ width: '100%' }}>
          <div className="skeleton skeleton-heading" style={{ width: '250px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '400px' }}></div>
        </div>
      </div>
      
      <div className="stats-grid mb-6">
        <div className="stats-card" style={{ height: '140px' }}>
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '24px' }}></div>
          <div className="skeleton skeleton-heading" style={{ width: '60%' }}></div>
        </div>
        <div className="stats-card" style={{ height: '140px' }}>
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '24px' }}></div>
          <div className="skeleton skeleton-heading" style={{ width: '60%' }}></div>
        </div>
        <div className="stats-card" style={{ height: '140px' }}>
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '24px' }}></div>
          <div className="skeleton skeleton-heading" style={{ width: '60%' }}></div>
        </div>
      </div>
      
      <div className="card" style={{ height: '300px' }}>
        <div className="skeleton skeleton-heading" style={{ width: '200px', marginBottom: '24px' }}></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
      </div>
    </div>
  );
}
