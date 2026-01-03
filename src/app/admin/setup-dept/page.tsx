"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupDept() {
  const [name, setName] = useState("");
  const [hodUsername, setHodUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/dept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, hodUsername }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Department created and HOD linked successfully!");
        router.push("/admin/departments");
      } else {
        alert("Error: " + (data.error || "Failed to create department"));
      }
    } catch (err) {
      alert("Network or Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link href="/admin/departments" className="text-indigo-600 hover:underline mb-4 inline-block">&larr; Back to Departments</Link>

      <div className="bg-white p-8 rounded shadow-lg border-t-4 border-indigo-600">
        <h2 className="text-2xl font-bold mb-6 text-black">Create Department</h2>
        <form onSubmit={handleCreateDept} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">Department Name</label>
            <input
              type="text" required className="w-full border p-2 rounded"
              placeholder="e.g. Computer Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-black">Assign HOD (By Username)</label>
            <input
              type="text" required className="w-full border p-2 rounded"
              placeholder="Enter the HOD's username"
              value={hodUsername}
              onChange={(e) => setHodUsername(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1 italic">
              * The HOD user must already exist in the system.
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Department & Link HOD"}
          </button>
        </form>
      </div>
    </div>
  );
}