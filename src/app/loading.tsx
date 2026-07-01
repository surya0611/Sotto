export default function RootLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
      <div className="spinner spinner-lg"></div>
    </div>
  );
}
