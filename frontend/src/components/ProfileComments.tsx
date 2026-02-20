import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useUserComments, useUpdateComment, useDeleteComment } from "@/hooks";
import { formatRelativeTime } from "@/utils";
import type { Comment } from "@/types";

interface ProfileCommentsProps {
  username: string;
  isOwnProfile: boolean;
}

const scrollToTabs = () => {
  document.getElementById("profile-tabs")?.scrollIntoView({ behavior: "smooth" });
};

const CLAMP_LIMIT = 200;

export default function ProfileComments({
  username,
  isOwnProfile,
}: ProfileCommentsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserComments(username, page);

  useEffect(() => { setPage(1); }, [username]);
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await updateComment.mutateAsync({
      commentId: editingId,
      data: { content: editContent.trim() },
    });
    setEditingId(null);
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await deleteComment.mutateAsync(commentId);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 animate-pulse"
          >
            <div className="w-10 h-10 rounded-lg bg-bg-hover flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-bg-hover rounded" />
              <div className="h-4 w-full bg-bg-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.comments.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle">
        <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No comments yet.</p>
      </div>
    );
  }

  return (
    <>
      <div key={page} className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
        <AnimatePresence initial={false}>
          {data.comments.map((comment) => {
            const isLong = comment.content.length > CLAMP_LIMIT;
            const isExpanded = expandedIds.has(comment.id);

            return (
              <motion.div
                key={comment.id}
                layout
                initial={false}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      {comment.track_name && (
                        comment.artist_id ? (
                          <Link
                            to={`/artist/${comment.artist_id}`}
                            className="text-sm font-medium text-text-primary truncate hover:underline"
                          >
                            {comment.track_name}
                            {comment.artist_name && <> by {comment.artist_name}</>}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-text-primary truncate">
                            {comment.track_name}
                            {comment.artist_name && <> by {comment.artist_name}</>}
                          </span>
                        )
                      )}
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>

                    {editingId === comment.id ? (
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          maxLength={1000}
                          className="flex-1 px-3 py-1.5 bg-bg-base border border-border-subtle rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-default"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button
                          onClick={handleSaveEdit}
                          disabled={updateComment.isPending}
                          className="p-1.5 text-success-500 hover:bg-success-500/10 rounded transition-default"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-text-muted hover:bg-bg-hover rounded transition-default"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        <p className="text-sm text-text-secondary break-words">
                          {isLong && !isExpanded
                            ? comment.content.slice(0, CLAMP_LIMIT) + "..."
                            : comment.content}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleExpand(comment.id)}
                            className="flex items-center gap-0.5 text-xs text-primary-400 hover:text-primary-300 mt-1 transition-default"
                          >
                            {isExpanded ? "Show less" : "Show more"}
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {isOwnProfile && editingId !== comment.id && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded transition-default"
                        aria-label="Edit comment"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="p-1.5 text-text-muted hover:text-error-400 hover:bg-error-400/10 rounded transition-default"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); scrollToTabs(); }}
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
            onClick={() => { setPage((p) => Math.min(data.pages, p + 1)); scrollToTabs(); }}
            disabled={page === data.pages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-default"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
