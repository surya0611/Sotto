'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
}

interface OverviewChartsProps {
  data: DailyStats[];
}

export function OverviewCharts({ data }: OverviewChartsProps) {
  const hasData = data && data.length > 0;
  
  if (!hasData) {
    return (
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--r-lg)',
        color: 'var(--text-muted)'
      }}>
        Not enough data yet. Check back soon.
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding: 'var(--s-6)',
      width: '100%',
    }}>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 'var(--s-6)' }}>
        Performance (Last 7 Days)
      </h3>
      
      <div style={{ height: '320px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--fg-muted)' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--fg-muted)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--bg)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                color: 'var(--fg)'
              }}
              itemStyle={{ fontWeight: 600 }}
              labelStyle={{ color: 'var(--fg-muted)', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="impressions" 
              name="Impressions"
              stroke="var(--secondary)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorImpressions)" 
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              name="Clicks"
              stroke="var(--primary)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorClicks)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
