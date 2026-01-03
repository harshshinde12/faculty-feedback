"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProgramsList() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchPrograms = () => {
        fetch("/api/admin/program")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setPrograms(data);
            })
            .catch((err) => console.error("Failed to load programs", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the program.")) return;
        try {
            const res = await fetch(`/api/admin/program?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPrograms(prev => prev.filter(p => p._id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch (e) { alert("Error deleting"); }
    };

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
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {programs.map((prog) => (
                                    <tr key={prog._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">{prog.name}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{prog.type}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {/* Handle both array (new) and string (legacy) if exists */}
                                            {Array.isArray(prog.academicYears) ? prog.academicYears.join(", ") : prog.academicYears}
                                        </td>
                                        <td className="p-4 text-gray-400 text-xs font-mono">{prog.deptId}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <Link
                                                href={`/admin/setup-program?id=${prog._id}`}
                                                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(prog._id)}
                                                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
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
