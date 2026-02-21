import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminComments, useAdminDeleteComment } from "@/hooks";
import { formatRelativeTime, extractError } from "@/utils";
import AdminNav from "@/components/admin/AdminNav";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { ErrorState } from "@/components/discovery";

export default function AdminComments() {
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const { data, isLoading, isError, error, refetch } = useAdminComments(page, includeDeleted);
  const deleteComment = useAdminDeleteComment();

  useEffect(() => {
    document.title = "Comments — Admin — SoundScout";
    return () => { document.title = "SoundScout"; };
  }, []);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleToggleDeleted = () => {
    setIncludeDeleted((prev) => !prev);
    setPage(1);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteComment.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
      onError: (err) => {
        setDeleteTarget(null);
        setToastMsg(extractError(err, "Failed to delete comment"));
      },
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
            <h1 className="text-2xl font-bold text-text-primary">Comments</h1>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={handleToggleDeleted}
                className="w-4 h-4 rounded border-border-subtle bg-bg-surface text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              />
              Show deleted
            </label>
          </div>

          {isError ? (
            <ErrorState
              message={error?.message || "Failed to load comments"}
              onRetry={refetch}
            />
          ) : isLoading ? (
            <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle last:border-b-0 animate-pulse"
                >
                  <div className="w-9 h-9 rounded-full bg-bg-hover" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-bg-hover rounded" />
                    <div className="h-3 w-full bg-bg-hover rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data || data.comments.length === 0 ? (
            <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle">
              <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No comments found.</p>
            </div>
          ) : (
            <>
              <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
                {data.comments.map((comment) => {
                  const initial = comment.username.charAt(0).toUpperCase();

                  return (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 px-5 py-4 border-b border-border-subtle last:border-b-0 hover:bg-bg-hover/50 transition-default"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden mt-0.5">
                        {comment.avatar_url ? (
                          <img
                            src={comment.avatar_url}
                            alt={comment.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {initial}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <Link
                            to={`/user/${comment.username}`}
                            className="text-sm font-medium text-text-primary hover:text-primary-400 transition-default"
                          >
                            {comment.username}
                          </Link>
                          <span className="text-xs text-text-muted">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary break-words line-clamp-2 mb-1">
                          {comment.content}
                        </p>
                        {comment.track_name && (
                          <Link
                            to={`/artist/${comment.artist_id}`}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-default"
                          >
                            {comment.track_name}
                            {comment.artist_name && <> — {comment.artist_name}</>}
                          </Link>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(comment.id)}
                        className="p-2 text-text-muted hover:text-error-400 hover:bg-error-400/10 rounded-lg transition-default flex-shrink-0"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteComment.isPending}
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
