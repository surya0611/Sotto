'use client';

import { SottoEvent } from '@/types';

export function ExportButton({ events }: { events: SottoEvent[] }) {
  const handleExport = () => {
    if (!events || events.length === 0) return;

    // Create CSV header
    const headers = ['ID', 'Event Type', 'Source', 'Customer Name', 'City', 'Region', 'Product Name', 'Created At'];
    
    // Create CSV rows
    const rows = events.map(event => [
      event.id,
      event.event_type,
      event.source,
      event.customer_name || '',
      event.customer_city || '',
      event.customer_region || '',
      event.product_name || '',
      new Date(event.created_at).toISOString()
    ]);

    // Combine headers and rows, handle escaping commas and quotes
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          const cellStr = String(cell);
          // Escape quotes and wrap in quotes if there's a comma
          if (cellStr.includes(',') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('url');
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.setAttribute('download', `sotto_events_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <button 
      onClick={handleExport}
      className="btn btn-secondary"
      disabled={events.length === 0}
    >
      <span style={{ marginRight: '8px' }}>↓</span>
      Export CSV
    </button>
  );
}
