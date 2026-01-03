"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SubjectsList() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/subject")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setSubjects(data);
            })
            .catch((err) => console.error("Failed to load subjects", err))
            .finally(() => setLoading(false));
    }, []);

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
                                            <div className="text-xs text-gray-400 font-normal">{sub.division ? `Div: ${sub.division}` : ''}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-mono">{sub.code || "N/A"}</td>
                                        <td className="p-4 text-sm">
                                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                                {sub.academicYear}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {sub.facultyId?.username || "Unassigned"}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-gray-400 text-xs">View Only</span>
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
