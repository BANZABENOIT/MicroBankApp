import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./ClientLayout.css";

function ClientLayout({ title, subtitle, children }) {
  return (
    <div className="c-layout">
      <Sidebar />
      <div className="c-content">
        <Topbar title={title} subtitle={subtitle} />
        <main className="c-main">{children}</main>
      </div>
    </div>
  );
}

export default ClientLayout;
