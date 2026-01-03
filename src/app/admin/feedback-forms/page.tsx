"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FeedbackFormsList() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/forms")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setForms(data);
            })
            .catch((err) => console.error("Failed to load forms", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Feedback Forms</h2>
                    <p className="text-gray-500 mt-1">Manage feedback questionnaires and deployment</p>
                </div>
                <Link
                    href="/admin/manage-forms"
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                    <span>+ Create New Form</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading forms...</div>
                ) : forms.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                        No feedback forms found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Target Audience</th>
                                    <th className="p-4">Faculty</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {forms.map((form) => (
                                    <tr key={form._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">
                                            {form.title}
                                            <div className="text-xs text-gray-400 font-normal">Created: {new Date(form.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-semibold">{form.subjectId?.name || "Unknown Subject"}</span>
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">
                                                    {form.courseYear}
                                                </span>
                                                <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[10px]">
                                                    Div: {form.division}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {form.facultyName || "N/A"}
                                        </td>
                                        <td className="p-4 text-right">
                                            {/* Placeholder for future delete/edit functionality */}
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
