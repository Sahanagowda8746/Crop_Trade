'use client';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const waterUsageData = [
  { day: 'Mon', liters: 1300 },
  { day: 'Tue', liters: 1150 },
  { day: 'Wed', liters: 1400 },
  { day: 'Thu', liters: 1200 },
  { day: 'Fri', liters: 1550 },
  { day: 'Sat', liters: 1450 },
  { day: 'Sun', liters: 1250 },
];

export default function WaterUsageChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={waterUsageData}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k L`} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                <Line type="monotone" dataKey="liters" name="Liters" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}
