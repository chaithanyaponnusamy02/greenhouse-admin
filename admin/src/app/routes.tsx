import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import ActivityOverview from "./pages/ActivityOverview";
import EvaluationSummary from "./pages/EvaluationSummary";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AdminLayout from "./layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: UserManagement },
      { path: "activities", Component: ActivityOverview },
      { path: "evaluations", Component: EvaluationSummary },
      { path: "reports", Component: Reports },
      { path: "notifications", Component: Notifications },
      { path: "settings", Component: Settings },
      { path: "profile", Component: Profile },
    ],
  },
]);
