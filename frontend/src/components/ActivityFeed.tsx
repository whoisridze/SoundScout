import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Music2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserActivity } from "@/hooks";
import { formatRelativeTime } from "@/utils";

interface ActivityFeedProps {
  username: string;
}

const scrollToTabs = () => {
  document.getElementById("profile-tabs")?.scrollIntoView({ behavior: "smooth" });
};

export default function ActivityFeed({ username }: ActivityFeedProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserActivity(username, page);

  useEffect(() => { setPage(1); }, [username]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-bg-surface rounded-xl border border-border-subtle animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-bg-hover flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-bg-hover rounded" />
              <div className="h-3 w-1/3 bg-bg-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-16 bg-bg-surface rounded-2xl border border-border-subtle">
        <Music2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No activity yet</p>
      </div>
    );
  }

  return (
    <>
      <div key={page} className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
        <AnimatePresence>
          {data.items.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0 hover:bg-bg-hover transition-default">
            {item.type === "favorite" ? (
              <>
                <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  {item.album_image ? (
                    <img
                      src={item.album_image}
                      alt=""
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <Heart className="w-5 h-5 text-accent-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    Liked{" "}
                    {item.artist_id ? (
                      <Link to={`/artist/${item.artist_id}`} className="hover:underline">
                        <span className="font-medium">{item.track_name}</span>
                        {item.artist_name && <> by {item.artist_name}</>}
                      </Link>
                    ) : (
                      <>
                        <span className="font-medium">{item.track_name}</span>
                        {item.artist_name && <> by {item.artist_name}</>}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    Commented on{" "}
                    {item.artist_id ? (
                      <Link to={`/artist/${item.artist_id}`} className="hover:underline">
                        <span className="font-medium">{item.track_name || "a track"}</span>
                        {item.artist_name && <> by {item.artist_name}</>}
                      </Link>
                    ) : (
                      <>
                        <span className="font-medium">{item.track_name || "a track"}</span>
                        {item.artist_name && <> by {item.artist_name}</>}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </>
            )}
              </div>
            </motion.div>
          ))}
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
