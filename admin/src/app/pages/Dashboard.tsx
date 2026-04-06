import { useEffect, useState } from "react";
import {
  Leaf,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://greenhouse-backend-kvyr.onrender.com/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (!res.ok) {
          console.error("API Error:", result);
          return;
        }

        setData(result);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!data) return <p>Error loading dashboard</p>;

  // ✅ Stats Mapping
  const stats = [
    {
      title: data.totalScore.label,
      value: data.totalScore.value,
      icon: Leaf,
      color: "bg-[#2E7D32]",
      trend: `${data.totalScore.change}%`,
    },
    {
      title: data.totalActivities.label,
      value: data.totalActivities.value,
      icon: TrendingUp,
      color: "bg-[#388E3C]",
      trend: `${data.totalActivities.change}%`,
    },
    {
      title: data.totalUsers.label,
      value: data.totalUsers.value,
      icon: Users,
      color: "bg-[#43A047]",
      trend: `${data.totalUsers.change}%`,
    },
    {
      title: "Approved Activities",
      value: data.statusDistribution.approved.count,
      icon: CheckCircle,
      color: "bg-[#4CAF50]",
      trend: `${data.statusDistribution.approvedActivitiesChange}%`,
    },
  ];

  // ✅ Pie Chart Data
  const activityStatusData = [
    {
      name: "Approved",
      value: data.statusDistribution.approved.count,
      color: "#4CAF50",
    },
    {
      name: "Pending",
      value: data.statusDistribution.pending.count,
      color: "#FFC107",
    },
    {
      name: "Rejected",
      value: data.statusDistribution.rejected.count,
      color: "#F44336",
    },
  ];

  // ✅ Bar Chart Data
  const categoryScoreData = data.scoreByCategory || [];

  // ✅ Recent Activities
  const recentActivities = data.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-green-600 mt-2">{stat.trend}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full h-12 mt-6`}>
                <stat.icon className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <CheckCircle className="text-green-500 mb-2" />
          <h3>Approved</h3>
          <p className="text-2xl font-bold text-green-500">
            {data.statusDistribution.approved.count}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <Clock className="text-yellow-500 mb-2" />
          <h3>Pending</h3>
          <p className="text-2xl font-bold text-yellow-500">
            {data.statusDistribution.pending.count}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <XCircle className="text-red-500 mb-2" />
          <h3>Rejected</h3>
          <p className="text-2xl font-bold text-red-500">
            {data.statusDistribution.rejected.count}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="mb-4 font-semibold">
            Activity Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={activityStatusData} dataKey="value">
                {activityStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="mb-4 font-semibold">Score by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#2E7D32" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="mb-4 font-semibold">Recent Activities</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Activity</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Score</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {recentActivities.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{item.activity}</td>
                <td className="p-2">{item.user}</td>

                {/* ✅ Green Badge */}
                <td className="p-2">
                  <span className="px-2 py-1 rounded-full bg-[#A5D6A7] text-[#2E7D32] text-xs">
                    {item.category}
                  </span>
                </td>

                <td className="p-2">{item.score}</td>

                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : item.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}