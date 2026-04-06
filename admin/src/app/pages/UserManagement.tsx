import { useEffect, useState } from "react";
import { Search, UserPlus, Edit, Trash2 } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Missing states (fixed)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });

  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // ✅ Fetch Users API
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://greenhouse-backend-kvyr.onrender.com/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to fetch users");
        return;
      }

      // ✅ remove admins
      const filtered = data.filter((u) => u.role !== "admin");
      setUsers(filtered);
    } catch (err) {
      setError("Server not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Add User API (Register)
  const handleAddUser = async (e) => {
  e.preventDefault();
  setAddError("");
  setSuccessMsg("");
  setAddLoading(true);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("https://greenhouse-backend-kvyr.onrender.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (!res.ok) {
      setAddError(data.detail || "Failed to add user");
      return;
    }

    // ✅ SUCCESS MESSAGE
    setSuccessMsg(`${newUser.role} added successfully!`);

    // reset form
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "student",
      department: "",
    });

    fetchUsers();

    // ✅ Auto close modal after 1.5 seconds
    setTimeout(() => {
      setShowAddModal(false);
      setSuccessMsg("");
    }, 1500);
  } catch (err) {
    setAddError("Server not responding. Try again.");
  } finally {
    setAddLoading(false);
  }
};


  // ✅ Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "All" ||
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and roles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#1B5E20] transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Loading + Error */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-4 text-gray-600">
          Loading users...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 rounded-lg p-4">{error}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="auditor">Auditor</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{users.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Auditors</p>
          <p className="text-2xl font-bold text-[#2E7D32]">
            {users.filter((u) => u.role === "auditor").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Faculty</p>
          <p className="text-2xl font-bold text-[#2E7D32]">
            {users.filter((u) => u.role === "faculty").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Students</p>
          <p className="text-2xl font-bold text-[#2E7D32]">
            {users.filter((u) => u.role === "student").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      {!loading && filteredUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.user_id || user._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                      {user.name}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A5D6A7] text-[#2E7D32]">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.department}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-[#2E7D32]" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
          No users found.
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Add New User
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              {addError && (
                <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {addError}
                </div>
              )}
              {successMsg && (
  <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
    {successMsg}
  </div>
)}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder="Enter name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder="Enter password"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="faculty">faculty</option>
                  <option value="auditor">auditor</option>
                  <option value="student">student</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) =>
                    setNewUser({ ...newUser, department: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  placeholder="Enter department"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors disabled:opacity-60"
                >
                  {addLoading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
