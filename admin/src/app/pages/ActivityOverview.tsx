import { useEffect, useState } from "react";
import { Search, Eye, Filter } from "lucide-react";

type ActivityRecord = {
  activity_id?: string;
  title?: unknown;
  faculty_id?: unknown;
  category?: unknown;
  activity_date?: string;
  status?: unknown;
  description?: unknown;
};

type ActivityItem = {
  id: string;
  title: string;
  user: string;
  category: string;
  date: string;
  score: number;
  status: string;
  proof: string;
  description: string;
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
    const preferredKeys = ["name", "title", "email", "category", "description", "status", "_id", "id"];

    for (const key of preferredKeys) {
      if (key in value) {
        const normalized = getDisplayText(value[key], "");
        if (normalized) return normalized;
      }
    }
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

const formatDate = (value?: string) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().split("T")[0];
};

export default function ActivityOverview() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://greenhouse-backend-kvyr.onrender.com/api/admin/activities", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await res.json()) as ActivityRecord[] | { detail?: string };

        if (!res.ok) {
          console.error("API Error:", data);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Unexpected response:", data);
          return;
        }

        const formattedData = data.map((item) => ({
          id: item.activity_id || crypto.randomUUID(),
          title: getDisplayText(item.title, "Untitled Activity"),
          user: getUserDisplay(item.faculty_id),
          category: getDisplayText(item.category),
          date: formatDate(item.activity_date),
          score: 0,
          status: getDisplayText(item.status, "unknown").toLowerCase(),
          proof: "No file",
          description: getDisplayText(item.description, "No description available"),
        }));

        setActivities(formattedData);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchActivities();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      activity.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Loading activities...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Activity Overview
        </h2>
        <p className="text-gray-600 mt-1">
          View and manage all green activities
        </p>
      </div>

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

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
