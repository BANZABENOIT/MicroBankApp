import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./AdminLayout.css";

function AdminLayout({ title, subtitle, children }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="admin-layout">
      <Sidebar user={user} />
      <div className="admin-content">
        <Topbar title={title} subtitle={subtitle} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
