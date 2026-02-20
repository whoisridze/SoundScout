import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts";
import { useChangeEmail, useChangePassword, useDeleteAccount } from "@/hooks";
import { FormInput, Button } from "@/components";
import { extractError } from "@/utils";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Settings — SoundScout";
    return () => {
      document.title = "SoundScout";
    };
  }, []);

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[700px] mx-auto px-6 py-10">
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.h1
          className="text-3xl font-bold text-text-primary mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          Settings
        </motion.h1>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <EmailSection currentEmail={user?.email || ""} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <PasswordSection />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DeleteAccountSection />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const changeEmail = useChangeEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) return;
    if (email.toLowerCase() === currentEmail.toLowerCase()) {
      setError("New email is the same as current email");
      return;
    }

    try {
      await changeEmail.mutateAsync({ email, password });
      setSuccess("Email updated successfully");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      setError(extractError(err, "Failed to update email"));
    }
  };

  return (
    <div className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold text-text-primary">Email</h2>
      </div>
      <p className="text-sm text-text-muted mb-4">
        Current email: <span className="text-text-secondary">{currentEmail}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="new-email"
          label="New Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter new email"
          autoComplete="email"
        />
        <FormInput
          id="email-password"
          label="Confirm Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-error-500">{error}</p>}
        {success && <p className="text-sm text-success-500">{success}</p>}
        <Button
          type="submit"
          isLoading={changeEmail.isPending}
          disabled={!email.trim() || !password}
          size="sm"
        >
          Update Email
        </Button>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const changePassword = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      return;
    }
    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(extractError(err, "Failed to change password"));
    }
  };

  return (
    <div className="bg-bg-surface rounded-2xl border border-border-subtle p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold text-text-primary">Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="current-password"
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Enter current password"
          autoComplete="current-password"
        />
        <FormInput
          id="new-password"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
          autoComplete="new-password"
        />
        <FormInput
          id="confirm-password"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-error-500">{error}</p>}
        {success && <p className="text-sm text-success-500">{success}</p>}
        <Button
          type="submit"
          isLoading={changePassword.isPending}
          disabled={!currentPassword || !newPassword || !confirmPassword}
          size="sm"
        >
          Change Password
        </Button>
      </form>
    </div>
  );
}

function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const deleteAccount = useDeleteAccount();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) return;

    try {
      await deleteAccount.mutateAsync({ password });
      window.location.href = "/";
    } catch (err: unknown) {
      setError(extractError(err, "Failed to delete account"));
    }
  };

  return (
    <div className="bg-bg-surface rounded-2xl border border-error-500/30 p-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-error-400" />
        <h2 className="text-lg font-semibold text-error-400">Danger Zone</h2>
      </div>
      <p className="text-sm text-text-muted mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!showConfirm ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(true)}
          className="!border-error-500/40 !text-error-400 hover:!bg-error-500/10"
        >
          Delete Account
        </Button>
      ) : (
        <AnimatePresence>
          <motion.form
            onSubmit={handleDelete}
            className="space-y-4 pt-2 border-t border-border-subtle mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-text-secondary pt-4">
              Enter your password to confirm account deletion.
            </p>
            <FormInput
              id="delete-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-error-500">{error}</p>}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword("");
                  setError("");
                }}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={!password || deleteAccount.isPending}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-error-500 text-white hover:bg-error-600 transition-default disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteAccount.isPending
                  ? "Deleting..."
                  : "Permanently Delete Account"}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  );
}
