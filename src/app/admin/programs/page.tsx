"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProgramsList() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/program")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setPrograms(data);
            })
            .catch((err) => console.error("Failed to load programs", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Programs</h2>
                    <p className="text-gray-500 mt-1">Manage academic programs (UG/PG)</p>
                </div>
                <Link
                    href="/admin/setup-program"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <span>+ Add Program</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading programs...</div>
                ) : programs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                        No programs found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Program Name</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Years</th>
                                    <th className="p-4">Department ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {programs.map((prog) => (
                                    <tr key={prog._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">{prog.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${prog.type === 'UG' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {prog.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {prog.academicYears?.join(", ")}
                                        </td>
                                        <td className="p-4 text-gray-400 text-xs font-mono">{prog.deptId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
