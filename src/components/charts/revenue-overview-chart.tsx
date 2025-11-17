'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 35000 },
  { month: 'Feb', revenue: 28000 },
  { month: 'Mar', revenue: 42000 },
  { month: 'Apr', revenue: 55000 },
  { month: 'May', revenue: 48000 },
  { month: 'Jun', revenue: 45000 },
];

export default function RevenueOverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
