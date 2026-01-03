"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function UserManagement() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("FACULTY");
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setDeleting(userId);
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                alert("Failed to delete user");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting user");
        } finally {
            setDeleting(null);
        }
    };

    const filteredUsers = users.filter((u: any) => u.role === activeTab);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-500 mt-1">Manage system users and roles</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                    Refresh List
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                    {["FACULTY", "STUDENT", "HOD", "ADMIN"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setActiveTab(role)}
                            className={`px-6 py-4 text-sm font-semibold transition-all ${activeTab === role
                                    ? "border-b-2 border-indigo-600 text-indigo-600 bg-white"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {role}s
                        </button>
                    ))}
                </div>

                {/* content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                            No {activeTab.toLowerCase()}s found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3 pl-2">Username</th>
                                        <th className="pb-3">Details</th>
                                        <th className="pb-3 text-right pr-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 group">
                                            <td className="py-4 pl-2">
                                                <div className="font-semibold text-gray-800">{user.username}</div>
                                                <div className="text-xs text-gray-500">ID: {user._id}</div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600">
                                                <div className="flex flex-wrap gap-2">
                                                    {user.programId && (
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{activeTab === 'STUDENT' ? 'Cmpn' : 'Dept'}</span>
                                                    )}
                                                    {user.rollNo && (
                                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">Roll: {user.rollNo}</span>
                                                    )}
                                                    {user.academicYear && (
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{user.academicYear}</span>
                                                    )}
                                                    {user.division && (
                                                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs">Div: {user.division}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 text-right pr-2">
                                                {user.role !== "ADMIN" && (
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        disabled={deleting === user._id}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === user._id ? "Removing..." : "Remove"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
