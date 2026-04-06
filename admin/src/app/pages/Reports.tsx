import { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar } from "lucide-react";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("Monthly");

  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [lastReport, setLastReport] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch API with JWT
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://greenhouse-backend-kvyr.onrender.com/api/admin/reports", {
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
        setTotalReports(data.totalReportsGenerated || 0);
        setTotalDownloads(data.totalDownloads || 0);
        setLastReport(data.lastReport?.split("T")[0] || "");

        // ✅ Format reports
        const formatted = (data.reports || []).map((item) => ({
          id: item.report_id,
          title:
            item.title ||
            `Green Score Certification - ${item.date?.split("T")[0]}`,
          type: item.type,
          date: item.date?.split("T")[0],
          score: item.total_score || 0,
          activities: item.activities || 0,
          status: item.status,
        }));

        setReports(formatted);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleGenerate = () => {
    alert("Report generation API can be connected here!");
  };

  // ⏳ Loading
  if (loading) {
    return <p className="text-center mt-10">Loading reports...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Reports & Certification
        </h2>
        <p className="text-gray-600 mt-1">
          Generate and download green score reports
        </p>
      </div>

      {/* Generate Report */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Generate New Report</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Annual</option>
            <option>Custom</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />

          <button
            onClick={handleGenerate}
            className="bg-[#2E7D32] text-white rounded-lg px-4 py-2"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-700 text-white p-6 rounded-lg">
          <FileText className="mb-2" />
          <p>Total Reports</p>
          <h2 className="text-3xl">{totalReports}</h2>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-lg">
          <Download className="mb-2" />
          <p>Total Downloads</p>
          <h2 className="text-3xl">{totalDownloads}</h2>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-lg">
          <Calendar className="mb-2" />
          <p>Last Report</p>
          <h2 className="text-lg">{lastReport}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">Activities</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b">
                <td className="p-3">{report.title}</td>

                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-[#A5D6A7] text-[#2E7D32] text-xs">
                    {report.type}
                  </span>
                </td>

                <td className="p-3">{report.date}</td>

                <td className="p-3 text-green-700 font-medium">
                  {report.score}
                </td>

                <td className="p-3">{report.activities}</td>

                <td className="p-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {report.status}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button>
                    <Eye className="w-4 h-4 text-green-700" />
                  </button>
                  <button>
                    <Download className="w-4 h-4 text-green-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}