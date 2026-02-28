"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#94a3b8"];

interface Props {
  chartData: {
    month: string;
    users: number;
    listings: number;
    transactions: number;
    revenue: number;
  }[];
  statusData: { name: string; value: number }[];
}

export function AdminCharts({ chartData, statusData }: Props) {
  const totalListings = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Growth chart — takes 2 cols */}
      <Card className="lg:col-span-2">
        <CardHeader className="py-3 px-5">
          <CardTitle className="text-sm font-semibold">Platform Growth</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <Tabs defaultValue="overview">
            <TabsList className="ml-3 mb-2 h-7 text-xs">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="listings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="users" name="Users" stroke="#3b82f6" fill="url(#users)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="listings" name="Listings" stroke="#a855f7" fill="url(#listings)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="revenue">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v: any) => `₦${Number(v).toLocaleString()}`}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Listing status pie */}
      <Card>
        <CardHeader className="py-3 px-5">
          <CardTitle className="text-sm font-semibold">Listing Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full">
            {statusData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground capitalize">{item.name}</span>
                <span className="text-xs font-semibold ml-auto">
                  {totalListings ? Math.round((item.value / totalListings) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}