import { useEffect, useState } from "react";
import { FileText, Download, Eye, Calendar, X } from "lucide-react";
import { jsPDF } from "jspdf";

type ReportSummary = {
  id: string | number;
  title: string;
  type: string;
  date: string;
  score: number;
  activities: number;
  status: string;
};

type UserRecord = {
  user_id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  status?: string;
};

type ActivityRecord = {
  activity_id?: string;
  title?: string;
  faculty_id?: unknown;
  category?: string;
  activity_date?: string;
  status?: string;
  description?: string;
};

type EvaluationRecord = {
  auditor?: unknown;
  activity?: unknown;
  student?: unknown;
  category?: unknown;
  score?: number;
  date?: string;
  remarks?: unknown;
};

type AuditorStat = {
  name: unknown;
  department?: unknown;
  avgScore?: number | string;
  count?: number;
};

type DashboardData = {
  totalScore?: { value?: number };
  totalActivities?: { value?: number };
  totalUsers?: { value?: number };
  statusDistribution?: {
    approved?: { count?: number };
    pending?: { count?: number };
    rejected?: { count?: number };
  };
  scoreByCategory?: Array<{ category?: string; score?: number }>;
  recentActivities?: Array<{
    activity?: unknown;
    user?: unknown;
    category?: unknown;
    score?: number;
    status?: unknown;
  }>;
};

type GeneratedReport = {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  periodLabel: string;
  summary: {
    totalUsers: number;
    totalActivities: number;
    approvedActivities: number;
    pendingActivities: number;
    rejectedActivities: number;
    totalEvaluations: number;
    averageScore: number;
    greenScore: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    user: string;
    category: string;
    date: string;
    status: string;
    description: string;
  }>;
  evaluations: Array<{
    auditor: string;
    activity: string;
    student: string;
    category: string;
    score: number;
    date: string;
    remarks: string;
  }>;
  auditorStats: Array<{
    name: string;
    department: string;
    avgScore: string;
    count: number;
  }>;
  categoryScores: Array<{ category: string; score: number }>;
  recentActivities: Array<{
    activity: string;
    user: string;
    category: string;
    score: number;
    status: string;
  }>;
};

type ReportsApiResponse = {
  totalReportsGenerated?: number;
  totalDownloads?: number;
  lastReport?: string;
  reports?: Array<{
    report_id?: string | number;
    title?: string;
    type?: string;
    date?: string;
    total_score?: number;
    activities?: number;
    status?: string;
  }>;
};

type EvaluationsApiResponse = {
  totalEvaluations?: number;
  averageScore?: string;
  auditorStats?: AuditorStat[];
  evaluations?: EvaluationRecord[];
};

const API_BASE = "https://greenhouse-backend-kvyr.onrender.com/api/admin";

const formatDate = (value?: string) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().split("T")[0];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getDisplayText = (value: unknown, fallback = "N/A"): string => {
  if (value == null) return fallback;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const normalized = String(value).trim();
    return normalized || fallback;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => getDisplayText(item, ""))
      .filter(Boolean)
      .join(", ");
    return normalized || fallback;
  }

  if (isRecord(value)) {
    const preferredKeys = ["name", "title", "email", "category", "remarks", "status", "_id", "id"];

    for (const key of preferredKeys) {
      if (key in value) {
        const normalized = getDisplayText(value[key], "");
        if (normalized) return normalized;
      }
    }

    return fallback;
  }

  return fallback;
};

const getUserDisplay = (value: unknown) => {
  if (isRecord(value)) {
    const name = getDisplayText(value.name, "");
    const email = getDisplayText(value.email, "");
    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
  }

  return getDisplayText(value);
};

const isWithinRange = (value: string | undefined, startDate: string, endDate: string) => {
  if (!value) return true;

  const normalizedValue = formatDate(value);

  if (startDate && normalizedValue < startDate) return false;
  if (endDate && normalizedValue > endDate) return false;
  return true;
};

const getReportPeriodLabel = (startDate: string, endDate: string, reportType: string) => {
  if (startDate && endDate) {
    return `${startDate} to ${endDate}`;
  }

  if (startDate) {
    return `${startDate} onwards`;
  }

  if (endDate) {
    return `Up to ${endDate}`;
  }

  return `${reportType} overall summary`;
};

const buildReportContent = (report: GeneratedReport) => {
  const summaryLines = [
    `Title: ${report.title}`,
    `Type: ${report.type}`,
    `Generated At: ${report.generatedAt}`,
    `Period: ${report.periodLabel}`,
    "",
    "Summary",
    `- Green Score: ${report.summary.greenScore}`,
    `- Total Users: ${report.summary.totalUsers}`,
    `- Total Activities: ${report.summary.totalActivities}`,
    `- Approved Activities: ${report.summary.approvedActivities}`,
    `- Pending Activities: ${report.summary.pendingActivities}`,
    `- Rejected Activities: ${report.summary.rejectedActivities}`,
    `- Total Evaluations: ${report.summary.totalEvaluations}`,
    `- Average Evaluation Score: ${report.summary.averageScore}%`,
    "",
    "Users By Role",
    ...report.usersByRole.map((item) => `- ${item.role}: ${item.count}`),
    "",
    "Users",
    ...report.users.map(
      (user) =>
        `- ${user.name} | ${user.email} | ${user.role} | ${user.department} | ${user.status}`
    ),
    "",
    "Activities",
    ...report.activities.map(
      (activity) =>
        `- ${activity.title} | ${activity.category} | ${activity.user} | ${activity.date} | ${activity.status} | ${activity.description}`
    ),
    "",
    "Evaluations",
    ...report.evaluations.map(
      (evaluation) =>
        `- ${evaluation.auditor} | ${evaluation.activity} | ${evaluation.student} | ${evaluation.category} | ${evaluation.score} | ${evaluation.date} | ${evaluation.remarks}`
    ),
    "",
    "Auditor Statistics",
    ...report.auditorStats.map(
      (stat) =>
        `- ${stat.name} | ${stat.department} | Avg Score: ${stat.avgScore}% | Evaluations: ${stat.count}`
    ),
  ];

  return summaryLines.join("\n");
};

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("Monthly");

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [lastReport, setLastReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchWithToken = async <T,>(endpoint: string): Promise<T> => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = (await response.json()) as T | { detail?: string };

    if (!response.ok) {
      const message =
        typeof data === "object" && data && "detail" in data
          ? data.detail || "Request failed"
          : "Request failed";
      throw new Error(message);
    }

    return data as T;
  };

  const fetchReports = async () => {
    try {
      const data = await fetchWithToken<ReportsApiResponse>("/reports");

      setTotalReports(data.totalReportsGenerated || 0);
      setTotalDownloads(data.totalDownloads || 0);
      setLastReport(formatDate(data.lastReport));

      const formatted = (data.reports || []).map((item) => ({
        id: item.report_id || crypto.randomUUID(),
        title:
          item.title || `Green Score Certification - ${formatDate(item.date)}`,
        type: item.type || "Report",
        date: formatDate(item.date),
        score: item.total_score || 0,
        activities: item.activities || 0,
        status: item.status || "generated",
      }));

      setReports(formatted);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReports();
  }, []);

  const handleGenerate = async () => {
    if (startDate && endDate && startDate > endDate) {
      setGenerateError("Start date cannot be after end date.");
      return;
    }

    setGenerateError("");
    setGenerateLoading(true);

    try {
      const [dashboard, users, activities, evaluationData] = await Promise.all([
        fetchWithToken<DashboardData>("/dashboard"),
        fetchWithToken<UserRecord[]>("/users"),
        fetchWithToken<ActivityRecord[]>("/activities"),
        fetchWithToken<EvaluationsApiResponse>("/evaluations"),
      ]);

      const filteredUsers = users.filter((user) => user.role !== "admin");
      const filteredActivities = activities.filter((activity) =>
        isWithinRange(activity.activity_date, startDate, endDate)
      );
      const filteredEvaluations = (evaluationData.evaluations || []).filter((evaluation) =>
        isWithinRange(evaluation.date, startDate, endDate)
      );

      const approvedActivities = filteredActivities.filter(
        (activity) => activity.status === "approved"
      ).length;
      const pendingActivities = filteredActivities.filter(
        (activity) => activity.status === "pending"
      ).length;
      const rejectedActivities = filteredActivities.filter(
        (activity) => activity.status === "rejected"
      ).length;

      const usersByRoleMap = filteredUsers.reduce<Record<string, number>>((acc, user) => {
        const role = user.role || "unknown";
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const totalEvaluationScore = filteredEvaluations.reduce(
        (sum, evaluation) => sum + (evaluation.score || 0),
        0
      );
      const averageScore = filteredEvaluations.length
        ? Number((totalEvaluationScore / filteredEvaluations.length).toFixed(1))
        : Number(String(evaluationData.averageScore || "0").replace("%", ""));

      const timestamp = new Date();
      const generatedAt = timestamp.toISOString().split("T")[0];
      const reportId = `generated-${timestamp.getTime()}`;

      const nextReport: GeneratedReport = {
        id: reportId,
        title: `${reportType} Green Score Report`,
        type: reportType,
        generatedAt,
        periodLabel: getReportPeriodLabel(startDate, endDate, reportType),
        summary: {
          totalUsers: filteredUsers.length,
          totalActivities: filteredActivities.length,
          approvedActivities,
          pendingActivities,
          rejectedActivities,
          totalEvaluations: filteredEvaluations.length,
          averageScore,
          greenScore: dashboard.totalScore?.value || 0,
        },
        usersByRole: Object.entries(usersByRoleMap).map(([role, count]) => ({
          role,
          count,
        })),
        users: filteredUsers.map((user) => ({
          id: user.user_id || user._id || crypto.randomUUID(),
          name: user.name || "N/A",
          email: user.email || "N/A",
          role: user.role || "N/A",
          department: user.department || "N/A",
          status: user.status || "active",
        })),
        activities: filteredActivities.map((activity) => ({
          id: activity.activity_id || crypto.randomUUID(),
          title: activity.title || "Untitled Activity",
          user: getUserDisplay(activity.faculty_id),
          category: getDisplayText(activity.category),
          date: formatDate(activity.activity_date),
          status: getDisplayText(activity.status, "unknown"),
          description: getDisplayText(activity.description, "No description available"),
        })),
        evaluations: filteredEvaluations.map((evaluation) => ({
          auditor: getUserDisplay(evaluation.auditor),
          activity: getDisplayText(evaluation.activity),
          student: getUserDisplay(evaluation.student),
          category: getDisplayText(evaluation.category),
          score: evaluation.score || 0,
          date: formatDate(evaluation.date),
          remarks: getDisplayText(evaluation.remarks, "No remarks"),
        })),
        auditorStats: (evaluationData.auditorStats || []).map((stat) => ({
          name: getDisplayText(stat.name),
          department: getDisplayText(stat.department),
          avgScore: String(stat.avgScore || 0),
          count: stat.count || 0,
        })),
        categoryScores: (dashboard.scoreByCategory || []).map((item) => ({
          category: getDisplayText(item.category),
          score: item.score || 0,
        })),
        recentActivities: (dashboard.recentActivities || []).map((item) => ({
          activity: getDisplayText(item.activity),
          user: getUserDisplay(item.user),
          category: getDisplayText(item.category),
          score: item.score || 0,
          status: getDisplayText(item.status, "unknown"),
        })),
      };

      setGeneratedReport(nextReport);
      setPreviewOpen(true);
      setReports((current) => [
        {
          id: nextReport.id,
          title: nextReport.title,
          type: nextReport.type,
          date: nextReport.generatedAt,
          score: nextReport.summary.greenScore,
          activities: nextReport.summary.totalActivities,
          status: "generated",
        },
        ...current.filter((report) => report.id !== nextReport.id),
      ]);
      setTotalReports((current) => current + 1);
      setLastReport(nextReport.generatedAt);
    } catch (error) {
      console.error("Error generating report:", error);
      setGenerateError(
        error instanceof Error ? error.message : "Failed to generate report."
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  const handlePreview = (reportId: string | number) => {
    if (generatedReport && generatedReport.id === reportId) {
      setPreviewOpen(true);
    }
  };

  const handleDownload = (reportId?: string | number) => {
    if (!generatedReport || (reportId && generatedReport.id !== reportId)) {
      return;
    }

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const maxLineWidth = pageWidth - margin * 2;
    const lineHeight = 16;
    const lines = buildReportContent(generatedReport)
      .split("\n")
      .flatMap((line) => pdf.splitTextToSize(line || " ", maxLineWidth));

    let y = margin;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(generatedReport.title, margin, y);
    y += 28;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }

      pdf.text(line, margin, y);
      y += lineHeight;
    }

    pdf.save(`${generatedReport.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    setTotalDownloads((current) => current + 1);
  };

  if (loading) {
    return <p className="text-center mt-10">Loading reports...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Reports & Certification
        </h2>
        <p className="text-gray-600 mt-1">
          Generate and download green score reports
        </p>
      </div>

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
            onClick={() => void handleGenerate()}
            disabled={generateLoading}
            className="bg-[#2E7D32] text-white rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {generateLoading ? "Generating..." : "Generate"}
          </button>
        </div>

        {generateError && (
          <p className="mt-4 text-sm text-red-600">{generateError}</p>
        )}
      </div>

      {generatedReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {generatedReport.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Period: {generatedReport.periodLabel}
              </p>
              <p className="text-sm text-gray-600">
                Generated on {generatedReport.generatedAt}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => handleDownload()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-bold text-[#2E7D32]">
                {generatedReport.summary.totalUsers}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-[#2E7D32]">
                {generatedReport.summary.totalActivities}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Evaluations</p>
              <p className="text-2xl font-bold text-[#2E7D32]">
                {generatedReport.summary.totalEvaluations}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Green Score</p>
              <p className="text-2xl font-bold text-[#2E7D32]">
                {generatedReport.summary.greenScore}
              </p>
            </div>
          </div>
        </div>
      )}

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
            {reports.map((report) => {
              const canOpenGenerated = generatedReport?.id === report.id;

              return (
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
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs capitalize">
                      {report.status}
                    </span>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handlePreview(report.id)}
                      disabled={!canOpenGenerated}
                      className="disabled:opacity-40"
                    >
                      <Eye className="w-4 h-4 text-green-700" />
                    </button>
                    <button
                      onClick={() => handleDownload(report.id)}
                      disabled={!canOpenGenerated}
                      className="disabled:opacity-40"
                    >
                      <Download className="w-4 h-4 text-green-700" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {previewOpen && generatedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {generatedReport.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {generatedReport.periodLabel}
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {generatedReport.summary.totalUsers}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Activities</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {generatedReport.summary.totalActivities}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Evaluations</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {generatedReport.summary.totalEvaluations}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {generatedReport.summary.averageScore}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Users By Role</h4>
                  <div className="space-y-2">
                    {generatedReport.usersByRole.map((item) => (
                      <div
                        key={item.role}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize text-gray-600">{item.role}</span>
                        <span className="font-medium text-gray-800">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Activity Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-medium text-gray-800">
                        {generatedReport.summary.approvedActivities}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium text-gray-800">
                        {generatedReport.summary.pendingActivities}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rejected</span>
                      <span className="font-medium text-gray-800">
                        {generatedReport.summary.rejectedActivities}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Category Scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedReport.categoryScores.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-600">{item.category}</span>
                      <span className="font-medium text-gray-800">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Users</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Department</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3 capitalize">{user.role}</td>
                          <td className="p-3">{user.department}</td>
                          <td className="p-3 capitalize">{user.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Activities</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Title</th>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.activities.map((activity) => (
                        <tr key={activity.id} className="border-b">
                          <td className="p-3">{activity.title}</td>
                          <td className="p-3">{activity.user}</td>
                          <td className="p-3">{activity.category}</td>
                          <td className="p-3">{activity.date}</td>
                          <td className="p-3 capitalize">{activity.status}</td>
                          <td className="p-3">{activity.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Evaluations</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Auditor</th>
                        <th className="p-3 text-left">Activity</th>
                        <th className="p-3 text-left">Student</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Score</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.evaluations.map((evaluation, index) => (
                        <tr key={`${evaluation.auditor}-${index}`} className="border-b">
                          <td className="p-3">{evaluation.auditor}</td>
                          <td className="p-3">{evaluation.activity}</td>
                          <td className="p-3">{evaluation.student}</td>
                          <td className="p-3">{evaluation.category}</td>
                          <td className="p-3">{evaluation.score}</td>
                          <td className="p-3">{evaluation.date}</td>
                          <td className="p-3">{evaluation.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Auditor Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedReport.auditorStats.map((stat) => (
                    <div key={stat.name} className="rounded-lg bg-gray-50 p-4">
                      <p className="font-medium text-gray-800">{stat.name}</p>
                      <p className="text-sm text-gray-600">{stat.department}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Avg Score: {stat.avgScore}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Evaluations: {stat.count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Recent Activities</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Activity</th>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Score</th>
                        <th className="p-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedReport.recentActivities.map((activity, index) => (
                        <tr key={`${activity.activity}-${index}`} className="border-b">
                          <td className="p-3">{activity.activity}</td>
                          <td className="p-3">{activity.user}</td>
                          <td className="p-3">{activity.category}</td>
                          <td className="p-3">{activity.score}</td>
                          <td className="p-3 capitalize">{activity.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
