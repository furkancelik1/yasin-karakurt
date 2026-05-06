'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';
import { TrendingDown, TrendingUp, Scale, Zap } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface CheckInStats {
  id?: string;
  date: string;
  weight: number | null;
  bodyFat?: number | null;
  energy: number | null;
  sleep: number | null;
  submittedAt?: string;
  photos?: Array<{ id: string; url: string; angle: string | null }>;
}

interface StatsResponse {
  success: boolean;
  data: CheckInStats[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-charcoal border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-xs font-bold text-white mb-2">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-ash-400">{entry.name}:</span>
          <span className="text-white font-medium">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name.includes('Enerji') || entry.name.includes('Uyku') ? '' : ' kg'}
          </span>
        </div>
      ))}
    </div>
  );
}

interface StatsResponse {
  success: boolean;
  data: CheckInStats[];
}

interface ProgressChartProps {
  userId?: string;
}

export function ProgressChart({ userId }: ProgressChartProps) {
  const [data, setData] = useState<CheckInStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = userId 
      ? `/checkins/client/${userId}/stats`
      : '/checkins/stats';
    
    api.get<StatsResponse>(url)
      .then(({ data: res }) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error('Stats error:', err);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ash-400">
        <Scale size={32} className="mb-2" />
        <p className="text-sm">Henüz yeterli veri yok</p>
        <p className="text-xs text-ash-500 mt-1">En az 2 hafta form doldurmalısın</p>
      </div>
    );
  }

  const latestWeight = data[data.length - 1]?.weight;
  const firstWeight = data[0]?.weight;
  const weightDiff = latestWeight && firstWeight ? +(latestWeight - firstWeight).toFixed(1) : null;

  const latestEnergy = data[data.length - 1]?.energy;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ash-300">İlerleme Grafiği</h3>
        
        <div className="flex gap-4">
          {weightDiff !== null && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-bold',
              weightDiff < 0 ? 'text-emerald-400' : weightDiff > 0 ? 'text-rose-400' : 'text-ash-400'
            )}>
              {weightDiff < 0 ? <TrendingDown size={14} /> : weightDiff > 0 ? <TrendingUp size={14} /> : null}
              {weightDiff > 0 ? '+' : ''}{weightDiff} kg
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#333' }}
            />
            <YAxis 
              yAxisId="weight"
              stroke="#eab308"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(v) => `${v}kg`}
            />
            <YAxis 
              yAxisId="energy"
              orientation="right"
              stroke="#22c55e"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              name="Kilo (kg)"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ fill: '#eab308', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#eab308' }}
            />
            <Line
              yAxisId="energy"
              type="monotone"
              dataKey="energy"
              name="Enerji (1-10)"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#22c55e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
        <div className="text-center">
          <p className="text-xs text-ash-400 mb-1">Başlangıç Kilo</p>
          <p className="text-lg font-bold text-white">{firstWeight || '—'} kg</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-ash-400 mb-1">Güncel Kilo</p>
          <p className="text-lg font-bold text-gold">{latestWeight || '—'} kg</p>
        </div>
      </div>
    </div>
  );
}