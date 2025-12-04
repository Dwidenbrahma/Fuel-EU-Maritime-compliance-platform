import React from "react";
import { NavLink } from "react-router-dom";

type Tab = "Banking" | "Compare" | "Pooling" | "Routes";

const tabs: { label: Tab; to: string }[] = [
  { label: "Banking", to: "/banking" },
  { label: "Compare", to: "/compare" },
  { label: "Pooling", to: "/pooling" },
  { label: "Routes", to: "/routes" },
];

const NavBar: React.FC = () => {
  return (
    <nav className="w-full py-3" style={{ backgroundColor: "#4A70A9" }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left: Navigation Routes (Centered) */}
        <div className="flex-1 flex justify-center">
          <div className="inline-flex items-center gap-3">
            {tabs.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-white text-blue-700 shadow-md"
                      : "text-white hover:bg-white/20"
                  }`
                }>
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right: Logo */}
      </div>
    </nav>
  );
};

export default NavBar;
