import { useState, useEffect, useRef, forwardRef, memo } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts";
import {
  useArtistComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks";
import { formatRelativeTime } from "@/utils";
import type { Track, Comment } from "@/types";

interface CommentsSectionProps {
  artistId: string;
  artistName: string;
  commentingTrack: Track | null;
  onClearTrack: () => void;
}

const CommentsSection = forwardRef<HTMLDivElement, CommentsSectionProps>(
  function CommentsSection(
    { artistId, artistName, commentingTrack, onClearTrack },
    ref
  ) {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: commentsData, isLoading } = useArtistComments(artistId, page);
    const createComment = useCreateComment();
    const updateComment = useUpdateComment();
    const deleteComment = useDeleteComment();

    // Focus input when a track is selected
    useEffect(() => {
      if (commentingTrack) {
        inputRef.current?.focus();
      }
    }, [commentingTrack]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newComment.trim();
      if (!trimmed || !commentingTrack) return;

      await createComment.mutateAsync({
        track_id: commentingTrack.id,
        track_name: commentingTrack.name,
        artist_id: artistId,
        artist_name: artistName,
        content: trimmed,
      });
      setNewComment("");
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

    const isAdmin = user?.role === "admin";

    return (
      <div ref={ref} className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold text-text-primary">Comments</h2>
        </div>

        {/* Comment input */}
        {user ? (
          <div className="bg-bg-surface rounded-2xl border border-border-subtle px-4 py-3 mb-4">
            {commentingTrack ? (
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xs text-text-muted">Commenting on</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-500/10 text-primary-400 text-xs font-medium rounded-full">
                  {commentingTrack.name}
                  <button
                    onClick={onClearTrack}
                    className="hover:text-primary-300 transition-default"
                    aria-label="Clear track selection"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            ) : (
              <p className="text-xs text-text-muted mb-2.5">
                Click the comment icon on a track above to leave a comment
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-medium text-sm flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  commentingTrack
                    ? "Write a comment..."
                    : "Select a track first..."
                }
                disabled={!commentingTrack}
                maxLength={1000}
                className="flex-1 px-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-default disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={
                  !commentingTrack ||
                  !newComment.trim() ||
                  createComment.isPending
                }
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-default disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-text-muted mb-4">
            Sign in to leave a comment.
          </p>
        )}

        {/* Comments list */}
        {isLoading ? (
          <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 animate-pulse"
              >
                <div className="w-9 h-9 rounded-full bg-bg-hover flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-bg-hover rounded" />
                  <div className="h-4 w-full bg-bg-hover rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : commentsData && commentsData.comments.length > 0 ? (
          <>
            <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
              {commentsData.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0"
                >
                  <Link
                    to={`/user/${comment.username}`}
                    className="flex-shrink-0 hover:opacity-80 transition-default"
                  >
                    {comment.avatar_url?.trim() ? (
                      <img
                        src={comment.avatar_url}
                        alt={comment.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-medium text-sm">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-0.5">
                      <Link
                        to={`/user/${comment.username}`}
                        className="font-medium text-text-primary hover:text-primary-400 transition-default"
                      >
                        {comment.username}
                      </Link>
                      {" "}
                      <span className="text-xs text-text-muted">
                        on{" "}
                        <span className="text-text-secondary">
                          {comment.track_name}
                        </span>
                      </span>
                      {" "}
                      <span className="text-xs text-text-disabled">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </p>

                    {editingId === comment.id ? (
                      <div className="flex gap-2">
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
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary break-words">
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== comment.id &&
                    (comment.is_own || isAdmin) && (
                      <div className="flex gap-1 flex-shrink-0">
                        {comment.is_own && (
                          <button
                            onClick={() => handleEdit(comment)}
                            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded transition-default"
                            aria-label="Edit comment"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
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
              ))}
            </div>

            {/* Pagination */}
            {commentsData.pages > 1 && (
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
                  {page} / {commentsData.pages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(commentsData.pages, p + 1))
                  }
                  disabled={page === commentsData.pages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-default"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-bg-surface rounded-2xl border border-border-subtle">
            <MessageCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary text-sm">
              No comments yet. Be the first!
            </p>
          </div>
        )}
      </div>
    );
  }
);

export default memo(CommentsSection);
