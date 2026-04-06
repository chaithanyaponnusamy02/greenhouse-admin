import { useState, useEffect } from "react";
import { Search, Eye, Filter } from "lucide-react";

export default function ActivityOverview() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState(null);

  // 🔥 Fetch API
 useEffect(() => {
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://greenhouse-backend-kvyr.onrender.com/api/admin/activities", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ IMPORTANT
        },
      });

      const data = await res.json();

      // ✅ Handle error response safely
      if (!res.ok) {
        console.error("API Error:", data);
        return;
      }

      // ✅ Ensure it's an array
      if (!Array.isArray(data)) {
        console.error("Unexpected response:", data);
        return;
      }

      const formattedData = data.map((item) => ({
        id: item.activity_id,
        title: item.title,
        user: item.faculty_id || "N/A",
        category: item.category,
        date: item.activity_date?.split("T")[0],
        score: 0,
        status: item.status,
        proof: "No file",
        description: item.description,
      }));

      setActivities(formattedData);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchActivities();
}, []);

  // 🔍 Filter Logic
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      activity.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // ⏳ Loading
  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Loading activities...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Activity Overview
        </h2>
        <p className="text-gray-600 mt-1">
          View and manage all green activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total Activities</p>
          <p className="text-2xl font-bold text-gray-800">
            {activities.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {activities.filter((a) => a.status === "approved").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {activities.filter((a) => a.status === "pending").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {activities.filter((a) => a.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm text-gray-600">
                  Activity
                </th>
                
                <th className="py-3 px-4 text-left text-sm text-gray-600">
                  Category
                </th>
                <th className="py-3 px-4 text-left text-sm text-gray-600">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-sm text-gray-600">
                  Score
                </th>
                <th className="py-3 px-4 text-left text-sm text-gray-600">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-sm text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredActivities.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{activity.title}</td>
                  <td className="py-3 px-4">{activity.category}</td>
                  <td className="py-3 px-4">{activity.date}</td>
                  <td className="py-3 px-4">
                    {activity.score || "-"}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    {activity.status}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedActivity(activity)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#2E7D32] text-white text-sm rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">
              {selectedActivity.title}
            </h3>

            <p><b>User:</b> {selectedActivity.user}</p>
            <p><b>Category:</b> {selectedActivity.category}</p>
            <p><b>Date:</b> {selectedActivity.date}</p>
            <p><b>Status:</b> {selectedActivity.status}</p>

            <p className="mt-3">
              <b>Description:</b> {selectedActivity.description}
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>

              {selectedActivity.status === "pending" && (
                <>
                  <button className="px-4 py-2 bg-red-500 text-white rounded">
                    Reject
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded">
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}