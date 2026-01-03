"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SetupProgram() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "UG",
    deptId: "",
  });

  // State for Checkboxes
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const router = useRouter();

  const AVAILABLE_YEARS = formData.type === "UG"
    ? ["FE", "SE", "TE", "BE"]
    : ["FY", "SY"]; // Adjust for PG if needed

  useEffect(() => {
    fetch("/api/admin/dept").then(res => res.json()).then(setDepartments);
  }, []);

  const handleYearChange = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare the data
    const payload = {
      ...formData,
      academicYears: selectedYears
    };

    try {
      const res = await fetch("/api/admin/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Program created successfully!");
        router.push("/admin/programs");
      } else {
        alert("Error: " + (data.message || "Failed to create program"));
      }
    } catch (err) {
      alert("Network or Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link href="/admin/programs" className="text-emerald-600 hover:underline mb-4 inline-block">&larr; Back to Programs</Link>

      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-emerald-500">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Program</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Selection */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Department</label>
            <select
              required className="w-full border p-2 rounded"
              onChange={(e) => setFormData({ ...formData, deptId: e.target.value })}
              value={formData.deptId}
            >
              <option value="">-- Select Dept --</option>
              {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>

          {/* Program Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Program Name</label>
            <input
              type="text" placeholder="e.g. B.Tech Computer Engineering" required
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Program Type */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Program Type</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
            </select>
          </div>

          {/* Academic Years (Checkboxes) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Academic Years</label>
            <div className="flex flex-wrap gap-4 bg-gray-50 p-3 rounded border">
              {AVAILABLE_YEARS.map(year => (
                <label key={year} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={year}
                    checked={selectedYears.includes(year)}
                    onChange={() => handleYearChange(year)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700 font-medium">{year}</span>
                </label>
              ))}
            </div>
            {selectedYears.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one year.</p>}
          </div>

          <button
            disabled={loading || selectedYears.length === 0}
            className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create Program"}
          </button>
        </form>
      </div>
    </div>
  );
}