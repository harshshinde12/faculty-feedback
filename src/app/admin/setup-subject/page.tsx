
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SetupSubject() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    deptId: "",
    programId: "",
    academicYear: "",
    division: "",
    batch: "",
    facultyId: "",
  });

  const [data, setData] = useState<{ depts: any[]; faculty: any[]; programs: any[] }>({ depts: [], faculty: [], programs: [] });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); // Get editId

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [deptRes, facRes, progRes] = await Promise.all([
          fetch("/api/admin/dept"),
          fetch("/api/admin/users?role=FACULTY"),
          fetch("/api/admin/program")
        ]);

        const depts = await deptRes.json();
        const faculty = await facRes.json();
        const allPrograms = await progRes.json();

        setData({
          depts: Array.isArray(depts) ? depts : [],
          faculty: Array.isArray(faculty) ? faculty : [],
          programs: Array.isArray(allPrograms) ? allPrograms : [],
        });

        // If Edit Mode, Fetch Subject Data
        if (editId) {
          const subjectRes = await fetch("/api/admin/subject");
          const subjects = await subjectRes.json();
          const sub = subjects.find((s: any) => s._id === editId);

          if (sub) {
            const getVal = (field: any) => field && field._id ? field._id : (field || "");
            const pid = getVal(sub.programId);

            // Set available years (Robust handler)
            if (pid && Array.isArray(allPrograms)) {
              const prog = allPrograms.find((p: any) => p._id === pid);
              if (prog) {
                let years: string[] = [];
                const ay = prog.academicYears;
                if (Array.isArray(ay)) {
                  years = ay;
                } else if (typeof ay === "string" && ay.trim() !== "") {
                  years = ay.includes(",") ? ay.split(",").map((y: string) => y.trim()) : [ay];
                }
                setAvailableYears(years);
              }
            }

            setFormData({
              name: sub.name,
              code: sub.code || "",
              deptId: getVal(sub.deptId),
              programId: pid,
              academicYear: sub.academicYear,
              division: sub.division || "",
              batch: sub.batch || "",
              facultyId: getVal(sub.facultyId)
            });
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [editId]);

  const handleProgramChange = (progId: string) => {
    const selectedProg: any = data.programs.find((p: any) => p._id === progId);
    let years: string[] = [];

    if (selectedProg) {
      const ay = selectedProg.academicYears;
      if (Array.isArray(ay)) {
        years = ay;
      } else if (typeof ay === "string" && ay.trim() !== "") {
        // Handle legacy string (comma-separated or single value)
        years = ay.includes(",") ? ay.split(",").map((y: string) => y.trim()) : [ay];
      }
    }

    // Fallback to standard years if empty
    if (years.length === 0) {
      years = ["FE", "SE", "TE", "BE", "FY", "SY"];
    }

    setAvailableYears(years);
    setFormData({ ...formData, programId: progId, academicYear: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData, id: editId };
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch("/api/admin/subject", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert(`Subject ${editId ? "Updated" : "Created"} Successfully!`);
        if (!editId) {
          setFormData({ ...formData, name: "", code: "", division: "", batch: "" });
        }
        router.push("/admin/subjects");
      } else {
        alert("Error: " + (result.error || "Failed"));
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = data.programs.filter(p => !formData.deptId || p.deptId === formData.deptId);

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/admin/subjects" className="text-orange-600 hover:underline mb-4 inline-block">&larr; Back to Subjects</Link>
      <div className="bg-white p-8 rounded shadow-lg border-t-4 border-orange-500">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{editId ? "Edit Subject" : "Add Subject"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Subject Name</label>
            <input
              type="text" required className="w-full border p-2 rounded"
              placeholder="e.g. Data Structures"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Subject Code</label>
            <input
              type="text" required className="w-full border p-2 rounded"
              placeholder="e.g. CSC302"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Department</label>
              <select
                required className="w-full border p-2 rounded bg-white text-gray-900"
                value={formData.deptId}
                onChange={(e) => setFormData({ ...formData, deptId: e.target.value, programId: "", academicYear: "" })}
              >
                <option value="">Select Dept</option>
                {data.depts.map((d: any) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Program</label>
              <select
                required className="w-full border p-2 rounded bg-white text-gray-900"
                value={formData.programId}
                onChange={(e) => handleProgramChange(e.target.value)}
                disabled={!formData.deptId}
              >
                <option value="">Select Program</option>
                {filteredPrograms.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Academic Year</label>
              <select
                required className="w-full border p-2 rounded bg-white text-gray-900"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                disabled={!formData.programId}
              >
                <option value="">Select Year</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Assignments</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Div (A)"
                  className="w-1/2 border p-2 rounded"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Batch (A1)"
                  className="w-1/2 border p-2 rounded"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Assign Faculty</label>
            <select
              className="w-full border p-2 rounded bg-white text-gray-900"
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
            >
              <option value="">-- Unassigned --</option>
              {data.faculty.map((f: any) => (
                <option key={f._id} value={f._id}>{f.username}</option>
              ))}
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700 disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? (editId ? "Updating..." : "Creating...") : (editId ? "Update Subject" : "Create Subject")}
          </button>
        </form>
      </div>
    </div>
  );
}