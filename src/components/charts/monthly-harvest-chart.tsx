'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const monthlyHarvestData = [
  { month: 'Jan', tons: 4.5 },
  { month: 'Feb', tons: 7.2 },
  { month: 'Mar', tons: 6.1 },
  { month: 'Apr', tons: 9.8 },
  { month: 'May', tons: 8.5 },
  { month: 'Jun', tons: 12.3 },
];

export default function MonthlyHarvestChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyHarvestData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}T`} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                <Bar dataKey="tons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
