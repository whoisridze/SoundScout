import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { useAdminStats, useAdminUsers, useAdminComments } from "@/hooks";
import { formatRelativeTime } from "@/utils";
import AdminNav from "@/components/admin/AdminNav";
import { ErrorState } from "@/components/discovery";

const statCards = [
  { key: "users" as const, label: "Users", icon: Users, color: "primary", to: "/admin/users" },
  { key: "comments" as const, label: "Comments", icon: MessageCircle, color: "accent", to: "/admin/comments" },
  { key: "favorites" as const, label: "Favorites", icon: Heart, color: "success", to: null },
];

const colorMap: Record<string, string> = {
  primary: "bg-primary-500/10 text-primary-400",
  accent: "bg-accent-500/10 text-accent-400",
  success: "bg-success-500/10 text-success-400",
};

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useAdminStats();
  const { data: usersData } = useAdminUsers(1);
  const { data: commentsData } = useAdminComments(1);

  useEffect(() => {
    document.title = "Admin — SoundScout";
    return () => { document.title = "SoundScout"; };
  }, []);

  const recentUsers = usersData?.users.slice(0, 5) ?? [];
  const recentComments = commentsData?.comments.slice(0, 5) ?? [];

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-6">
        <AdminNav />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-text-primary mb-6">
            Dashboard
          </h1>

          {isError ? (
            <ErrorState
              message={error?.message || "Failed to load stats"}
              onRetry={refetch}
            />
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map((card, i) => {
                  const Icon = card.icon;
                  const inner = (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[card.color]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm text-text-muted">
                          {card.label}
                        </span>
                      </div>
                      {isLoading ? (
                        <div className="h-8 w-20 bg-bg-hover rounded animate-pulse" />
                      ) : (
                        <p className="text-3xl font-bold text-text-primary">
                          {stats?.[card.key]?.toLocaleString() ?? 0}
                        </p>
                      )}
                    </>
                  );

                  const className = `bg-bg-surface rounded-2xl border border-border-subtle p-5 text-left ${card.to ? "hover:border-primary-500/30 transition-default" : ""}`;

                  return (
                    <motion.div
                      key={card.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      {card.to ? (
                        <Link to={card.to} className={`block ${className}`}>
                          {inner}
                        </Link>
                      ) : (
                        <div className={className}>{inner}</div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent users */}
                <motion.div
                  className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                    <h2 className="text-sm font-semibold text-text-primary">Recent Users</h2>
                    <Link
                      to="/admin/users"
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-default"
                    >
                      View all
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {recentUsers.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-text-muted">
                      No users yet
                    </div>
                  ) : (
                    recentUsers.map((user) => (
                      <Link
                        key={user.id}
                        to={`/user/${user.username}`}
                        className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/50 transition-default"
                      >
                        <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-text-primary truncate block">
                            {user.username}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatRelativeTime(user.created_at)}
                          </span>
                        </div>
                        {user.role === "admin" && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary-500/15 text-primary-400 rounded">
                            Admin
                          </span>
                        )}
                      </Link>
                    ))
                  )}
                </motion.div>

                {/* Recent comments */}
                <motion.div
                  className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
                    <h2 className="text-sm font-semibold text-text-primary">Recent Comments</h2>
                    <Link
                      to="/admin/comments"
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-default"
                    >
                      View all
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  {recentComments.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-text-muted">
                      No comments yet
                    </div>
                  ) : (
                    recentComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-3 px-5 py-3 border-b border-border-subtle last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden mt-0.5">
                          {comment.avatar_url ? (
                            <img src={comment.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                              {comment.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {comment.username}
                            </span>
                            <span className="text-xs text-text-muted">
                              {formatRelativeTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary truncate">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
