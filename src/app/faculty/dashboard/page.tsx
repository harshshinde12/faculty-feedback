"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function FacultyDashboard() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (existing useEffect) ...

  // ... (existing loading check) ...

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black">Faculty Dashboard</h2>
          <p className="text-slate-600 mt-2">View your subject feedback analytics</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>

      {session?.user && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-black">
            <strong>Welcome:</strong> {session.user.username}
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p className="text-black mt-2">Loading analytics...</p>
          </div>
        ) : analytics.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <p className="text-black text-lg">No feedback responses found yet.</p>
          </div>
        ) : (
          analytics.map((item: any) => (
            <div key={item._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
                    {item.subjectName || "Unnamed Subject"}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                      Class: {item.classYear} - {item.division}
                    </span>
                    {item.batch && (
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                        Batch: {item.batch}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-indigo-600 block">
                    {Number(item.averageRating).toFixed(1)}
                  </span>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Class Average</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-700 border-b pb-2">Rating Distribution</h4>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = item.distribution?.[star] || 0;
                    const percentage = item.totalSubmissions > 0
                      ? (count / item.totalSubmissions) * 100
                      : 0;

                    return (
                      <div key={star} className="flex items-center text-xs">
                        <span className="w-8 font-mono text-gray-500 font-bold">{star} ★</span>
                        <div className="flex-1 h-2 mx-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right text-gray-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                <span>Total Students Participated:</span>
                <span className="font-bold text-gray-900 text-lg">{item.totalSubmissions}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
