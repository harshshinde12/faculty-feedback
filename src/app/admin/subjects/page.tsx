"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubjectsList() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchSubjects = () => {
        fetch("/api/admin/subject")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setSubjects(data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subject?")) return;
        try {
            const res = await fetch(`/api/admin/subject?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSubjects(prev => prev.filter(s => s._id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch (e) { alert("Error deleting"); }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Subjects</h2>
                    <p className="text-gray-500 mt-1">Manage subjects, codes, and faculty assignments</p>
                </div>
                <Link
                    href="/admin/setup-subject"
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                    <span>+ Add Subject</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading subjects...</div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                        No subjects found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Subject Name</th>
                                    <th className="p-4">Code</th>
                                    <th className="p-4">Academic Year</th>
                                    <th className="p-4">Faculty</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subjects.map((sub) => (
                                    <tr key={sub._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">
                                            {sub.name}
                                        </td>
                                        <td className="p-4 text-sm font-mono text-gray-600">{sub.code}</td>
                                        <td className="p-4 text-sm">
                                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                                                {sub.academicYear}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {sub.facultyId ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    {/* Ideally we fetch faculty name, but ID/Username is often stored or populated. 
                                                       The API populates checking previous implementation. 
                                                       Checking `api/admin/subject/route.ts`: it does `populate('facultyId', 'username')`. 
                                                       So `sub.facultyId` is an object. */}
                                                    {sub.facultyId.username || "Assigned"}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <Link
                                                href={`/admin/setup-subject?id=${sub._id}`}
                                                className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(sub._id)}
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
