import { useState } from "react";
import { Lock, Database, Bell, Shield } from "lucide-react";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const [minScore, setMinScore] = useState("0");
  const [maxScore, setMaxScore] = useState("100");
  const [autoApproval, setAutoApproval] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleScoringRules = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Scoring rules updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600 mt-1">Manage system configuration</p>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#A5D6A7] rounded-lg">
            <Lock className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              placeholder="Confirm new password"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#A5D6A7] rounded-lg">
            <Bell className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
        </div>
        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? "bg-[#2E7D32]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                pushNotifications ? "bg-[#2E7D32]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  pushNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Weekly Report</p>
              <p className="text-sm text-gray-600">Receive weekly activity summary</p>
            </div>
            <button
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                weeklyReport ? "bg-[#2E7D32]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  weeklyReport ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Scoring Rules */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#A5D6A7] rounded-lg">
            <Shield className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Scoring Rules</h3>
        </div>
        <form onSubmit={handleScoringRules} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Score
              </label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Score
              </label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Auto Approval</p>
              <p className="text-sm text-gray-600">Automatically approve low-risk activities</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoApproval(!autoApproval)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoApproval ? "bg-[#2E7D32]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoApproval ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
          >
            Save Scoring Rules
          </button>
        </form>
      </div>

      {/* Backup & Maintenance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#A5D6A7] rounded-lg">
            <Database className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Backup & Maintenance</h3>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Last backup: February 9, 2026 at 11:30 PM
            </p>
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Create Backup Now
            </button>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              System maintenance and cleanup
            </p>
            <button className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              Run Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
