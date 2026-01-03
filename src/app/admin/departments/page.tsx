"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DepartmentsList() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDepts = () => {
        fetch("/api/admin/dept")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setDepartments(data);
            })
            .catch((err) => console.error("Failed to load departments", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDepts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete the department.")) return;
        try {
            const res = await fetch(`/api/admin/dept?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDepartments(prev => prev.filter(d => d._id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch (e) {
            alert("Error deleting");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Departments</h2>
                    <p className="text-gray-500 mt-1">Manage academic departments and HODs</p>
                </div>
                <Link
                    href="/admin/setup-dept"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <span>+ Add Department</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading departments...</div>
                ) : departments.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                        No departments found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Department Name</th>
                                    <th className="p-4">HOD ID (Ref)</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {departments.map((dept) => (
                                    <tr key={dept._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">{dept.name}</td>
                                        <td className="p-4 text-gray-600 font-mono text-xs">{dept.hodId || "N/A"}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <Link
                                                href={`/admin/setup-dept?id=${dept._id}`}
                                                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(dept._id)}
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
