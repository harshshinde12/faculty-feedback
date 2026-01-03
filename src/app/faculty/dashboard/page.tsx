"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const GRAVITY_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

export default function FacultyDashboard() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calls the API route defined in api/faculty/analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/faculty/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalytics();
    } else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Faculty Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Analytics for {session?.user?.username}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
        >
          Logout
        </button>
      </div>

      {analytics.length > 0 && (
        <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-700 mb-6">Overview: Average Rating per Subject</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subjectName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 5]} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="averageRating" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} name="Avg Rating" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analytics.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No feedback data available yet.</p>
          </div>
        ) : (
          analytics.map((item: any, idx) => {
            const pieData = [
              { name: '5 ★', value: item.distribution?.[5] || 0 },
              { name: '4 ★', value: item.distribution?.[4] || 0 },
              { name: '3 ★', value: item.distribution?.[3] || 0 },
              { name: '2 ★', value: item.distribution?.[2] || 0 },
              { name: '1 ★', value: item.distribution?.[1] || 0 },
            ].filter(d => d.value > 0);

            return (
              <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-indigo-100 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={item.subjectName}>
                      {item.subjectName}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {item.classYear}-{item.division}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {item.totalSubmissions} Reviews
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-3 py-2 rounded-xl text-center min-w-[70px]">
                    <span className="block text-2xl font-black text-indigo-600">
                      {Number(item.averageRating).toFixed(1)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Avg</span>
                  </div>
                </div>

                <div className="flex-1 min-h-[180px] relative">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GRAVITY_COLORS[index % GRAVITY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 text-sm">
                      No Data for Chart
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
