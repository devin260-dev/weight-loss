'use client';

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { LevelThreshold } from '@/types';
import { COLORS, LEVEL_COLORS } from '@/lib/constants';

interface ChartDataPoint {
  date: string;
  weight: number;
  runningAverage: number | null;
  index?: number;
}

interface WeightChartProps {
  data: ChartDataPoint[];
  thresholds: LevelThreshold[];
  currentLevel: number;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const CustomTooltip = ({ active, payload, label, dataLength }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload?: { index?: number } }>;
  label?: string;
  dataLength?: number;
}) => {
  if (active && payload && payload.length) {
    const weight = payload.find(p => p.dataKey === 'weight')?.value;
    const avg = payload.find(p => p.dataKey === 'runningAverage')?.value;

    // Determine if this is a partial average (less than 7 days)
    const pointIndex = payload[0]?.payload?.index;
    const daysUsed = pointIndex !== undefined ? Math.min(pointIndex + 1, 7) : 7;
    const isPartialAvg = daysUsed < 7;

    return (
      <div className="pixel-card p-2 text-sm">
        <p className="text-[var(--text-muted)]">{label}</p>
        {weight && (
          <p style={{ color: COLORS.chartDot }}>
            Weight: {weight.toFixed(1)} lbs
          </p>
        )}
        {avg && (
          <p style={{ color: COLORS.chartLine }}>
            {isPartialAvg ? `Avg (${daysUsed} day${daysUsed > 1 ? 's' : ''})` : '7-Day Avg'}: {avg.toFixed(1)} lbs
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function WeightChart({ data, thresholds, currentLevel }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="pixel-card p-8 flex items-center justify-center h-64">
        <p className="text-[var(--text-muted)] text-center">
          Start logging your weight to see your progress chart!
        </p>
      </div>
    );
  }

  // Calculate domain for Y axis
  const allWeights = data.map(d => d.weight);
  const allAverages = data.map(d => d.runningAverage).filter((a): a is number => a !== null);
  const thresholdWeights = thresholds.map(t => t.weightThreshold);

  const allValues = [...allWeights, ...allAverages, ...thresholdWeights];
  const minWeight = Math.floor(Math.min(...allValues) - 5);
  const maxWeight = Math.ceil(Math.max(...allValues) + 5);

  return (
    <div className="pixel-card p-4">
      <h3 className="text-sm text-[var(--text-muted)] mb-4">WEIGHT PROGRESS</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.backgroundLight}
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={COLORS.textMuted}
            tick={{ fill: COLORS.textMuted, fontSize: 10 }}
            tickLine={{ stroke: COLORS.textMuted }}
          />

          <YAxis
            domain={[minWeight, maxWeight]}
            stroke={COLORS.textMuted}
            tick={{ fill: COLORS.textMuted, fontSize: 10 }}
            tickLine={{ stroke: COLORS.textMuted }}
            tickFormatter={(value) => `${value}`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Level threshold lines */}
          {thresholds.map((threshold) => (
            <ReferenceLine
              key={threshold.level}
              y={threshold.weightThreshold}
              stroke={LEVEL_COLORS[threshold.level]}
              strokeDasharray="5 5"
              strokeWidth={threshold.level === currentLevel + 1 ? 2 : 1}
              label={{
                value: `L${threshold.level}`,
                position: 'right',
                fill: LEVEL_COLORS[threshold.level],
                fontSize: 10,
              }}
            />
          ))}

          {/* Running average line (partial during baseline, 7-day after) */}
          <Line
            type="monotone"
            dataKey="runningAverage"
            stroke={COLORS.chartLine}
            strokeWidth={3}
            dot={false}
            connectNulls
            name="Average"
          />

          {/* Daily weight scatter points */}
          <Scatter
            dataKey="weight"
            fill={COLORS.chartDot}
            name="Daily Weight"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
