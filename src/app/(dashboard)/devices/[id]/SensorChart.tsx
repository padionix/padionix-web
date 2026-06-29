'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

// ponytail: single chart, no animation, no legends — add when multiple charts differ
export default function SensorChart({ readings }: { readings: { recorded_at: string; temperature?: number; humidity?: number }[] }) {
  const data = [...readings].reverse().map(r => ({
    time: format(new Date(r.recorded_at), 'HH:mm'),
    suhu: r.temperature,
    humidity: r.humidity,
  }))

  return (
    <ResponsiveContainer width="100%" height={192}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
        <YAxis yAxisId="l" tick={{ fontSize: 10 }} />
        <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} />
        <Tooltip />
        <Line yAxisId="l" type="monotone" dataKey="suhu" stroke="hsl(var(--primary))" name="Suhu °C" dot={false} strokeWidth={2} />
        <Line yAxisId="r" type="monotone" dataKey="humidity" stroke="#16a34a" name="Kelembaban %" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
