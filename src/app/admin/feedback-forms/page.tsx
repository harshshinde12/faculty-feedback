"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FeedbackFormsList() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchForms = () => {
        fetch("/api/admin/forms")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setForms(data);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will permanently delete the form and its questions.")) return;
        try {
            const res = await fetch(`/api/admin/forms?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setForms(prev => prev.filter(f => f._id !== id));
            } else {
                alert("Failed to delete form");
            }
        } catch (e) { alert("Error deleting"); }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Feedback Forms</h2>
                    <p className="text-gray-500 mt-1">Create and manage feedback questionnaires</p>
                </div>
                <Link
                    href="/admin/manage-forms"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <span>+ Create New Form</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading forms...</div>
                ) : forms.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                        No forms found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Faculty</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {forms.map((form) => (
                                    <tr key={form._id} className="hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-gray-800">{form.title}</td>
                                        <td className="p-4 text-sm text-gray-600">{form.type}</td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {form.facultyId?.username || "All Faculty"}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {form.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDelete(form._id)}
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
