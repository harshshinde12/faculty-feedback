"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NAACReport() {
    const { data: session } = useSession();
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/reports/naac");
            const data = await res.json();
            if (Array.isArray(data)) {
                setReport(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Overall Stas
    const overallParticipation = report.length > 0
        ? report.reduce((acc, item) => acc + item.participationRate, 0) / report.length
        : 0;

    const overallSatisfaction = report.length > 0
        ? report.reduce((acc, item) => acc + item.satisfactionIndex, 0) / report.length
        : 0;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">NAAC Report</h2>
                    <p className="text-gray-500 mt-1">Faculty Feedback Analysis for Accreditation</p>
                </div>
                <button
                    onClick={fetchReport}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Overall Participation Rate</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-blue-600">
                            {overallParticipation.toFixed(1)}%
                        </span>
                        <span className="text-sm text-gray-400">average per course</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Overall Satisfaction Index</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-green-600">
                            {overallSatisfaction.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400">out of 5.0</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Generating report...</div>
                    ) : report.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No data available.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3 pl-2">Subject</th>
                                        <th className="pb-3">Faculty</th>
                                        <th className="pb-3">Class/Div</th>
                                        <th className="pb-3 text-center">Responses / Total</th>
                                        <th className="pb-3 text-center">Participation</th>
                                        <th className="pb-3 text-right pr-2">Satisfaction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {report.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="py-4 pl-2 font-medium text-gray-800">{item.subject}</td>
                                            <td className="py-4 text-gray-600">{item.faculty}</td>
                                            <td className="py-4 text-sm text-gray-500">{item.class}</td>
                                            <td className="py-4 text-center text-sm font-mono text-gray-600">
                                                {item.responses} / {item.totalStudents}
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.participationRate >= 75 ? 'bg-green-100 text-green-700' :
                                                        item.participationRate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.participationRate.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="py-4 text-right pr-2 font-bold text-gray-800">
                                                {item.satisfactionIndex.toFixed(2)}
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
