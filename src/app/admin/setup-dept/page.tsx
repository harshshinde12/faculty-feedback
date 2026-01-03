"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SetupDepartment() {
  const [name, setName] = useState("");
  const [hodUsername, setHodUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  useEffect(() => {
    if (editId) {
      setLoading(true);
      fetch("/api/admin/dept") // Fetch all and find by ID (since we don't have get-by-id endpoint yet, or we can add one. Wait, the GET returns all. I'll filter client side for now as it's small data, or better yet, fetch all and filter).
        // Actually, standard REST is nice but I'll iterate existing list.
        .then(res => res.json())
        .then(data => {
          const dept = data.find((d: any) => d._id === editId);
          if (dept) {
            setName(dept.name);
            // Note: We don't have HOD Username storage in ID. 
            // We might only be able to edit Name easily without fetching User details. 
            // Let's stick to Name for now or if possible fetch HOD name.
            // The HOD ID is in dept.hodId. We need the username to prefill.
            // This is tricky. I'll just let them enter a username to OVERWRITE the HOD.
            // If they leave it blank, maybe we keep it? 
            // For now, let's just allow Name edit cleanly.
          }
        })
        .finally(() => setLoading(false));
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editId ? "PUT" : "POST";
      const body = editId ? { id: editId, name, hodUsername } : { name, hodUsername };

      const res = await fetch("/api/admin/dept", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Department ${editId ? "Updated" : "Created"} Successfully`);
        router.push("/admin/departments");
      } else {
        alert("Error: " + (data.error || "Failed"));
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link href="/admin/departments" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to Departments</Link>

      <div className="bg-white p-6 shadow-md rounded-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-black">{editId ? "Edit Department" : "Create Department"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Engineering"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HOD Username <span className="text-gray-400 font-normal">(Existing User)</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={hodUsername}
              onChange={(e) => setHodUsername(e.target.value)}
              placeholder="e.g. prof_sharma"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty if HOD is not yet created.</p>
          </div>
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (editId ? "Updating..." : "Creating...") : (editId ? "Update Department" : "Create Department")}
          </button>
        </form>
      </div>
    </div>
  );
}