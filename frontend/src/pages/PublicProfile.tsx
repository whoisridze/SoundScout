import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Calendar,
  Activity,
} from "lucide-react";
import { usePublicProfile } from "@/hooks";
import { useAuth } from "@/contexts";
import {
  ActivityFeed,
  ProfileFavorites,
  ProfileComments,
} from "@/components";
import { ErrorState } from "@/components/discovery";

type TabId = "activity" | "favorites" | "comments";

const tabs: { id: TabId; label: string; icon: typeof Activity }[] = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "comments", label: "Comments", icon: MessageCircle },
];

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("activity");
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = usePublicProfile(username || "");

  useEffect(() => {
    if (profile) {
      document.title = `${profile.username} — SoundScout`;
    }
    return () => {
      document.title = "SoundScout";
    };
  }, [profile]);

  // Redirect to own profile
  if (user && username && user.username.toLowerCase() === username.toLowerCase()) {
    return <Navigate to="/profile" replace />;
  }

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
          message={error?.message || "User not found"}
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
            {profile.banner_url ? (
              <div className="h-40">
                <img
                  src={profile.banner_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
              </div>
            )}

            {/* Profile content */}
            <div className="px-8 pb-5">
              {/* Avatar overlapping banner */}
              <div className="-mt-12 mb-3 flex justify-center sm:justify-start">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary-500/40 to-accent-500/40 blur-lg opacity-60" />
                  <div className="relative w-20 h-20 rounded-full ring-4 ring-bg-surface shadow-xl overflow-hidden">
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
                  </div>
                </div>
              </div>

              {/* Info — fully below the banner */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-text-primary">
                  {profile.username}
                </h1>
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
            <ProfileFavorites
              username={profile.username}
              isOwnProfile={false}
            />
          )}
          {activeTab === "comments" && (
            <ProfileComments
              username={profile.username}
              isOwnProfile={false}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
