"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/events/constants";

interface RevenueChartProps {
  data: { month: string; revenue: number; reservations: number; events: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Revenue analytics</CardTitle>
        <p className="text-muted-foreground text-sm">Last 6 months — paid bookings</p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => formatPrice(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#c45c26" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
