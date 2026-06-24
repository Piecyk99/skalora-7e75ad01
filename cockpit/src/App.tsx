import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { RequireAuth } from "@/components/RequireAuth";
import Login from "@/pages/Login";
import Cockpit from "@/pages/Cockpit";
import Pipeline from "@/pages/Pipeline";
import Prospects from "@/pages/Prospects";
import Outreach from "@/pages/Outreach";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<RequireAuth permission="partner_leads.view"><Cockpit /></RequireAuth>} />
        <Route path="pipeline" element={<RequireAuth permission="partner_leads.view"><Pipeline /></RequireAuth>} />
        <Route path="prospects" element={<RequireAuth permission="prospects.view"><Prospects /></RequireAuth>} />
        <Route path="outreach" element={<RequireAuth permission="outreach.view"><Outreach /></RequireAuth>} />
        <Route path="admin" element={<RequireAuth permission="admin.manage_roles"><Admin /></RequireAuth>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
