import { useState } from "react";
import { User, Mail, Phone, Calendar, Edit2, Save, X } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@college.edu",
    phone: "+91 98765 43210",
    department: "Administration",
    role: "System Administrator",
    joinDate: "2025-01-15",
    bio: "Experienced administrator managing the Green Score Management System for the college's environmental initiatives."
  });

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover Banner */}
        <div className="h-32 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20]"></div>
        
        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <User className="w-16 h-16 text-[#2E7D32]" />
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Name & Role */}
            <div className="text-center">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold text-gray-800 text-center border-b-2 border-[#2E7D32] focus:outline-none"
                />
              ) : (
                <h3 className="text-2xl font-bold text-gray-800">{formData.name}</h3>
              )}
              <p className="text-gray-600 mt-1">{formData.role}</p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                ) : (
                  <p className="text-gray-800">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                ) : (
                  <p className="text-gray-800">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                ) : (
                  <p className="text-gray-800">{formData.department}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Join Date
                </label>
                <p className="text-gray-800">{formData.joinDate}</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              ) : (
                <p className="text-gray-800">{formData.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Activity Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A5D6A7] rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-[#2E7D32]" />
            </div>
            <p className="text-2xl font-bold text-gray-800">156</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#A5D6A7] rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-[#2E7D32]" />
            </div>
            <p className="text-2xl font-bold text-gray-800">342</p>
            <p className="text-sm text-gray-600">Activities</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#A5D6A7] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-800">218</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#A5D6A7] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-800">89</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Actions</h3>
        <div className="space-y-3">
          {[
            { action: "Approved Solar Panel Installation", time: "2 hours ago" },
            { action: "Added new user: Kavita Joshi", time: "5 hours ago" },
            { action: "Generated monthly report", time: "1 day ago" },
            { action: "Updated scoring rules", time: "2 days ago" },
            { action: "Rejected Bicycle Parking Setup", time: "3 days ago" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <p className="text-sm text-gray-800">{item.action}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
