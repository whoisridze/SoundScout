import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, MessageCircle } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
  { to: "/admin/comments", label: "Comments", icon: MessageCircle, end: false },
];

export default function AdminNav() {
  return (
    <div className="flex gap-1 mb-6 border-b border-border-subtle">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-default -mb-px ${
                isActive
                  ? "border-primary-500 text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {link.label}
          </NavLink>
        );
      })}
    </div>
  );
}
