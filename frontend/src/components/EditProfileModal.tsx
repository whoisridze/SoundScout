import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { FormInput, Button } from "@/components";
import { useUpdateProfile, useDeleteAvatar, useDeleteBanner } from "@/hooks";
import { extractError } from "@/utils";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentStatus: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentStatus,
  avatarUrl,
  bannerUrl,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [status, setStatus] = useState(currentStatus);
  const [error, setError] = useState("");
  const updateProfile = useUpdateProfile();
  const deleteAvatar = useDeleteAvatar();
  const deleteBanner = useDeleteBanner();

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setStatus(currentStatus);
      setError("");
    }
  }, [isOpen, currentUsername, currentStatus]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const isBusy = updateProfile.isPending || deleteAvatar.isPending || deleteBanner.isPending;

  const handleClose = useCallback(() => {
    if (!isBusy) onClose();
  }, [onClose, isBusy]);

  // Escape to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const updates: Record<string, string> = {};
    if (username !== currentUsername) updates.username = username;
    if (status !== currentStatus) updates.status = status;

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      await updateProfile.mutateAsync(updates);
      onClose();
    } catch (err: unknown) {
      setError(extractError(err, "Failed to update profile"));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-bg-elevated border border-border-subtle rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                Edit Profile
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-default"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image previews */}
            {(avatarUrl || bannerUrl) && (
              <div className="space-y-3 mb-6">
                {avatarUrl && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm text-text-secondary">Avatar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAvatar.mutate()}
                      disabled={deleteAvatar.isPending}
                      className="flex items-center gap-1.5 text-xs text-error-400 hover:text-error-300 disabled:opacity-50 transition-default"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleteAvatar.isPending ? "Removing..." : "Remove"}
                    </button>
                  </div>
                )}
                {bannerUrl && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={bannerUrl}
                        alt="Banner"
                        className="w-16 h-10 rounded-lg object-cover"
                      />
                      <span className="text-sm text-text-secondary">Banner</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBanner.mutate()}
                      disabled={deleteBanner.isPending}
                      className="flex items-center gap-1.5 text-xs text-error-400 hover:text-error-300 disabled:opacity-50 transition-default"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleteBanner.isPending ? "Removing..." : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                id="edit-username"
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="Enter username"
              />

              <div>
                <label
                  htmlFor="edit-status"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  Status
                </label>
                <input
                  id="edit-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  maxLength={100}
                  placeholder="What are you listening to?"
                  className="w-full px-4 py-3 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500 transition-default"
                />
                <p className="mt-1 text-xs text-text-muted text-right">
                  {status.length}/100
                </p>
              </div>

              {error && (
                <p className="text-sm text-error-500">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={updateProfile.isPending}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
