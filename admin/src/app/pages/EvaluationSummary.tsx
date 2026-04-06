import { useState, useEffect } from "react";
import { Search, Calendar } from "lucide-react";

export default function EvaluationSummary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [auditorFilter, setAuditorFilter] = useState("All");

  const [evaluations, setEvaluations] = useState([]);
  const [auditorStats, setAuditorStats] = useState([]);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch API
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://greenhouse-backend-kvyr.onrender.com/api/admin/evaluations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("API Error:", data);
          return;
        }

        // ✅ Stats
        setTotalEvaluations(data.totalEvaluations || 0);
        setAvgScore(data.averageScore?.replace("%", "") || 0);
        setAuditorStats(data.auditorStats || []);

        // ✅ Format evaluations (same structure as your mock)
        const formatted = (data.evaluations || []).map((item, index) => ({
          id: index + 1,
          auditor: item.auditor,
          activity: item.activity,
          student: item.student || "N/A",
          category: item.category,
          score: item.score || 0,
          maxScore: 100, // default since API doesn't give
          date: item.date?.split("T")[0],
          remarks: item.remarks,
        }));

        setEvaluations(formatted);
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  // ✅ Dynamic auditors list
  const auditors = Array.from(new Set(evaluations.map(e => e.auditor)));

  // ✅ Filter logic (same as yours)
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch =
      evaluation.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.student.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAuditor =
      auditorFilter === "All" || evaluation.auditor === auditorFilter;

    return matchesSearch && matchesAuditor;
  });

  // ⏳ Loading
  if (loading) {
    return <p className="text-center mt-10">Loading evaluations...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Evaluation Summary</h2>
        <p className="text-gray-600 mt-1">Monitor auditor evaluations and scoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Evaluations</p>
          <p className="text-3xl font-bold text-gray-800">{totalEvaluations}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Average Score</p>
          <p className="text-3xl font-bold text-[#2E7D32]">{avgScore}%</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Active Auditors</p>
          <p className="text-3xl font-bold text-gray-800">{auditors.length}</p>
        </div>
      </div>

      {/* Auditor Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Auditor-wise Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auditorStats.map((stat) => (
            <div key={stat.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-800">{stat.name}</p>
                  <p className="text-sm text-gray-600">{stat.department}</p>
                </div>
                <span className="px-3 py-1 bg-[#A5D6A7] text-[#2E7D32] text-sm font-medium rounded-full">
                  {stat.avgScore}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Evaluations completed:</span>
                <span className="font-medium text-gray-800">{stat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search evaluations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={auditorFilter}
              onChange={(e) => setAuditorFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="All">All Auditors</option>
              {auditors.map(auditor => (
                <option key={auditor} value={auditor}>{auditor}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left">Auditor</th>
              <th className="py-3 px-4 text-left">Activity</th>
     
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Score</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Remarks</th>
            </tr>
          </thead>

          <tbody>
            {filteredEvaluations.map((evaluation) => {
              const percentage = (evaluation.score / evaluation.maxScore * 100).toFixed(0);

              return (
                <tr key={evaluation.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{evaluation.auditor}</td>
                  <td className="py-3 px-4">{evaluation.activity}</td>
<td className="py-3 px-4">
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A5D6A7] text-[#2E7D32]">
    {evaluation.category}
  </span>
</td>
                  <td className="py-3 px-4">
                    {evaluation.score}/{evaluation.maxScore} ({percentage}%)
                  </td>

                  <td className="py-3 px-4">{evaluation.date}</td>
                  <td className="py-3 px-4">{evaluation.remarks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}