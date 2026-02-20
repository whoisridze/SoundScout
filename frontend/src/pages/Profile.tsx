import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Heart,
  MessageCircle,
  Calendar,
  Activity,
  Camera,
} from "lucide-react";
import { useProfile, useUploadAvatar, useUploadBanner } from "@/hooks";
import {
  ActivityFeed,
  EditProfileModal,
  ImageCropModal,
  ProfileFavorites,
  ProfileComments,
  Button,
} from "@/components";
import { ErrorState } from "@/components/discovery";
import { extractError } from "@/utils";

type TabId = "activity" | "favorites" | "comments";

const tabs: { id: TabId; label: string; icon: typeof Activity }[] = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "comments", label: "Comments", icon: MessageCircle },
];

export default function Profile() {
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const uploadAvatar = useUploadAvatar();
  const uploadBanner = useUploadBanner();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("activity");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<"avatar" | "banner">("avatar");
  const [uploadError, setUploadError] = useState("");

  // Auto-dismiss upload error
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  useEffect(() => {
    document.title = "Profile — SoundScout";
    return () => {
      document.title = "SoundScout";
    };
  }, []);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_AVATAR = 2 * 1024 * 1024;
  const MAX_BANNER = 5 * 1024 * 1024;

  const validateFile = (file: File, maxSize: number): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Only JPG, PNG, and WebP are allowed.";
    }
    if (file.size > maxSize) {
      return `File too large. Maximum: ${maxSize / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file, MAX_AVATAR);
      if (err) {
        setUploadError(err);
      } else {
        setUploadError("");
        setCropTarget("avatar");
        setCropFile(file);
      }
    }
    e.target.value = "";
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file, MAX_BANNER);
      if (err) {
        setUploadError(err);
      } else {
        setUploadError("");
        setCropTarget("banner");
        setCropFile(file);
      }
    }
    e.target.value = "";
  };

  const handleCropConfirm = (croppedFile: File) => {
    setCropFile(null);
    const onError = (err: Error) => {
      setUploadError(extractError(err, "Upload failed"));
    };
    if (cropTarget === "avatar") {
      uploadAvatar.mutate(croppedFile, { onError });
    } else {
      uploadBanner.mutate(croppedFile, { onError });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] relative">
        <div className="max-w-[1100px] mx-auto px-6 py-6">
          <div className="rounded-2xl bg-bg-surface border border-border-subtle overflow-hidden mb-6 animate-pulse">
            <div className="h-40 bg-bg-hover" />
            <div className="px-8 pb-5">
              <div className="flex flex-col sm:flex-row items-center gap-6 -mt-12 sm:-mt-10">
                <div className="w-20 h-20 rounded-full bg-bg-hover border-4 border-bg-surface" />
                <div className="flex-1 space-y-3 text-center sm:text-left pt-2">
                  <div className="h-8 w-48 bg-bg-hover rounded mx-auto sm:mx-0" />
                  <div className="h-4 w-56 bg-bg-hover rounded mx-auto sm:mx-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <ErrorState
          message={error?.message || "Failed to load profile"}
          onRetry={refetch}
        />
      </div>
    );
  }

  const initial = profile.username.charAt(0).toUpperCase();
  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-6">
        {/* Hero */}
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Gradient border glow */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary-600/50 via-accent-500/50 to-primary-600/50 blur-[1px]" />

          <div className="relative rounded-2xl bg-bg-surface overflow-hidden">
            {/* Banner */}
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="group relative h-40 w-full cursor-pointer"
              aria-label="Upload banner"
            >
              {profile.banner_url ? (
                <img
                  src={profile.banner_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-default flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-default" />
              </div>
              {uploadBanner.isPending && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerChange}
              className="hidden"
            />

            {/* Profile content */}
            <div className="px-8 pb-5">
              {/* Avatar overlapping banner */}
              <div className="-mt-12 mb-3 flex justify-center sm:justify-start">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary-500/40 to-accent-500/40 blur-lg opacity-60" />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="group relative w-20 h-20 rounded-full ring-4 ring-bg-surface shadow-xl overflow-hidden cursor-pointer"
                    aria-label="Upload avatar"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                        {initial}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-default flex items-center justify-center rounded-full">
                      <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-default" />
                    </div>
                    {uploadAvatar.isPending && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Info — fully below the banner */}
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-between flex-wrap">
                  <h1 className="text-2xl font-bold text-text-primary">
                    {profile.username}
                  </h1>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Profile
                  </Button>
                </div>
                {profile.status && (
                  <p className="text-sm text-text-muted mt-2">
                    {profile.status}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 text-sm text-text-muted justify-center sm:justify-start flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {joinedDate}
                  </div>
                  <span className="text-border-subtle">·</span>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-accent-500" />
                    <span className="font-medium text-text-secondary">{profile.favorites_count}</span>
                    {profile.favorites_count === 1 ? "favorite" : "favorites"}
                  </div>
                  <span className="text-border-subtle">·</span>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-primary-400" />
                    <span className="font-medium text-text-secondary">{profile.comments_count}</span>
                    {profile.comments_count === 1 ? "comment" : "comments"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div id="profile-tabs" className="flex gap-1 mb-6 border-b border-border-subtle">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-default -mb-px ${
                    isActive
                      ? "border-primary-500 text-text-primary"
                      : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "activity" && (
            <ActivityFeed username={profile.username} />
          )}
          {activeTab === "favorites" && (
            <ProfileFavorites username={profile.username} isOwnProfile />
          )}
          {activeTab === "comments" && (
            <ProfileComments username={profile.username} isOwnProfile />
          )}
        </motion.div>

        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          currentUsername={profile.username}
          currentStatus={profile.status || ""}
          avatarUrl={profile.avatar_url || null}
          bannerUrl={profile.banner_url || null}
        />

        <ImageCropModal
          file={cropFile}
          onClose={() => setCropFile(null)}
          onConfirm={handleCropConfirm}
          aspectRatio={cropTarget === "avatar" ? 1 : 16 / 3}
          cropShape={cropTarget === "avatar" ? "round" : "rect"}
          title={cropTarget === "avatar" ? "Crop Avatar" : "Crop Banner"}
          subtitle=""
        />
      </div>

      {/* Upload error toast */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-error-500/90 text-white text-sm font-medium rounded-xl shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
