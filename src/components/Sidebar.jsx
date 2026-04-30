import { NavLink } from "react-router-dom";
import { Box, Upload, LayoutDashboard, Cuboid } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Cuboid size={22} color="white" />
          </div>
          <span className="logo-text">GLB Vault</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
          id="nav-dashboard"
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/gallery"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
          id="nav-gallery"
        >
          <Box size={20} />
          Model Gallery
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
          id="nav-upload"
        >
          <Upload size={20} />
          Upload Model
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 16px" }}>
          GLB Vault v1.0
        </div>
      </div>
    </aside>
  );
}
