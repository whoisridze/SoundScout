import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts";
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from "@/hooks";
import { extractError } from "@/utils";
import AdminNav from "@/components/admin/AdminNav";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { ErrorState } from "@/components/discovery";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; username: string } | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data, isLoading, isError, error, refetch } = useAdminUsers(page, debouncedSearch || undefined);
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();

  useEffect(() => {
    document.title = "Users — Admin — SoundScout";
    return () => { document.title = "SoundScout"; };
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleToggleRole = (userId: string, currentRole: "user" | "admin") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    updateUser.mutate(
      { userId, data: { role: newRole } },
      { onError: (err) => setToastMsg(extractError(err, "Failed to update role")) },
    );
  };

  const handleToggleActive = (userId: string, currentActive: boolean) => {
    updateUser.mutate(
      { userId, data: { is_active: !currentActive } },
      { onError: (err) => setToastMsg(extractError(err, "Failed to update status")) },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
      onError: (err) => {
        setDeleteTarget(null);
        setToastMsg(extractError(err, "Failed to delete user"));
      },
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">Users</h1>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 transition-default"
              />
            </div>
          </div>

          {isError ? (
            <ErrorState
              message={error?.message || "Failed to load users"}
              onRetry={refetch}
            />
          ) : isLoading ? (
            <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-full bg-bg-hover" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-bg-hover rounded" />
                    <div className="h-3 w-48 bg-bg-hover rounded" />
                  </div>
                  <div className="h-8 w-24 bg-bg-hover rounded" />
                </div>
              ))}
            </div>
          ) : !data || data.users.length === 0 ? (
            <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle">
              <p className="text-text-secondary">No users found.</p>
            </div>
          ) : (
            <>
              <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
                {data.users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const initial = user.username.charAt(0).toUpperCase();

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/50 transition-default"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                            {initial}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/user/${user.username}`}
                            className="text-sm font-medium text-text-primary truncate hover:text-primary-400 transition-default"
                          >
                            {user.username}
                          </Link>
                          {user.role === "admin" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary-500/15 text-primary-400 rounded">
                              Admin
                            </span>
                          )}
                          {!user.is_active && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-error-500/15 text-error-400 rounded">
                              Inactive
                            </span>
                          )}
                          {isSelf && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent-500/15 text-accent-400 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 truncate">
                          {user.email} · Joined {formatDate(user.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      {!isSelf && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={updateUser.isPending}
                            className="p-2 text-text-muted hover:text-primary-400 hover:bg-primary-400/10 rounded-lg transition-default disabled:opacity-50"
                            title={user.role === "admin" ? "Demote to user" : "Promote to admin"}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            disabled={updateUser.isPending}
                            className={`p-2 rounded-lg transition-default disabled:opacity-50 ${
                              user.is_active
                                ? "text-text-muted hover:text-error-400 hover:bg-error-400/10"
                                : "text-text-muted hover:text-success-400 hover:bg-success-400/10"
                            }`}
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: user.id, username: user.username })}
                            className="p-2 text-text-muted hover:text-error-400 hover:bg-error-400/10 rounded-lg transition-default"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-default"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-text-muted">
                    {page} / {data.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-default"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.username}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteUser.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Error toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-error-500/90 text-white text-sm font-medium rounded-xl shadow-lg backdrop-blur-sm">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
