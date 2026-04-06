import { Bell, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    type: "approval",
    title: "Activity Approved",
    message: "Solar Panel Installation by Priya Sharma has been approved.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "pending",
    title: "Pending Review",
    message: "5 new activities are waiting for your review.",
    time: "4 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "rejection",
    title: "Activity Rejected",
    message: "Bicycle Parking Setup by Vikram Singh has been rejected.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    type: "system",
    title: "System Update",
    message: "System maintenance scheduled for February 15, 2026 at 10:00 PM.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    type: "approval",
    title: "Activity Approved",
    message: "Waste Segregation Drive by Amit Patel has been approved.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 6,
    type: "pending",
    title: "New Activity Submitted",
    message: "Organic Composting Unit has been submitted for review.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 7,
    type: "approval",
    title: "Activity Approved",
    message: "Campus Tree Plantation by Rajesh Kumar has been approved.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 8,
    type: "system",
    title: "Report Generated",
    message: "Monthly Green Score Report for January 2026 is ready.",
    time: "5 days ago",
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "approval":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "rejection":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case "system":
      return <AlertCircle className="w-5 h-5 text-blue-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getNotificationBg = (type: string, read: boolean) => {
  if (!read) return "bg-green-50 border-l-4 border-[#2E7D32]";
  return "bg-white";
};

export default function Notifications() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <p className="text-gray-600 mt-1">Stay updated with system alerts</p>
        </div>
        <button className="px-4 py-2 text-sm text-[#2E7D32] hover:bg-green-50 rounded-lg transition-colors">
          Mark all as read
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#2E7D32] rounded-full">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{mockNotifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-full">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-xl font-bold text-gray-800">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-full">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-800">
                {mockNotifications.filter(n => n.type === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">System</p>
              <p className="text-xl font-bold text-gray-800">
                {mockNotifications.filter(n => n.type === "system").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">All Notifications</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationBg(
                notification.type,
                notification.read
              )}`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        notification.read ? "text-gray-800" : "text-gray-900"
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-1 ${
                        notification.read ? "text-gray-600" : "text-gray-700"
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <span className="inline-block w-2 h-2 bg-[#2E7D32] rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State (commented out, shown when no notifications) */}
      {/* <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications</h3>
        <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
      </div> */}
    </div>
  );
}
