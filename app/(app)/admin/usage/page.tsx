"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UsageData {
  kpis: {
    totalUsers: number;
    totalConversations: number;
    totalMessages30d: number;
    totalTokens30d: number;
    totalCost30d: number;
  };
  dailyTokens: { date: string; tokens: number }[];
  byModel: { model: string; tokens: number }[];
  byUser: { email: string; tokens: number }[];
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/usage")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  const { kpis } = data;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usage Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Users", value: kpis.totalUsers },
          { label: "Conversations", value: kpis.totalConversations },
          { label: "Messages (30d)", value: kpis.totalMessages30d },
          { label: "Tokens (30d)", value: kpis.totalTokens30d.toLocaleString() },
          { label: "Cost (30d)", value: `$${kpis.totalCost30d.toFixed(4)}` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border-2 border-[#0a0a23] p-4">
            <div className="text-xs text-[#6b7280] uppercase">{kpi.label}</div>
            <div className="text-2xl font-black mt-1">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border-2 border-[#0a0a23] p-4">
          <h3 className="font-bold mb-3">Daily Tokens (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.dailyTokens}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0a0a23" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" stroke="#0a0a23" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border-2 border-[#0a0a23] p-4">
          <h3 className="font-bold mb-3">Tokens by Model (Top 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byModel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0a0a23" />
              <XAxis dataKey="model" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="tokens" fill="#0a0a23" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border-2 border-[#0a0a23] p-4">
        <h3 className="font-bold mb-3">Top 10 Users by Tokens</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.byUser}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0a0a23" />
            <XAxis dataKey="email" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="tokens" fill="#0a0a23" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
