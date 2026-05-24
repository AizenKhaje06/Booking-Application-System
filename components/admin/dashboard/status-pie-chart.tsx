"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "hsl(38 92% 50%)",
  "hsl(142 71% 45%)",
  "hsl(0 72% 51%)",
  "hsl(220 14% 46%)",
  "hsl(262 83% 58%)",
];

interface StatusPieChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export function StatusPieChart({ data, title = "Reservation status" }: StatusPieChartProps) {
  const chartData = data.filter((d) => d.value > 0);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
              No data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
