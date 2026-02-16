import { memo } from "react";
import { Link } from "react-router-dom";
import { Users, Play } from "lucide-react";
import { formatFollowers } from "@/utils";
import type { Artist } from "@/types";

interface ArtistCardProps {
  artist: Artist;
  replace?: boolean;
}

function ArtistCard({ artist, replace }: ArtistCardProps) {
  const imageUrl = artist.images[0]?.url;

  return (
    <Link
      to={`/artist/${artist.id}`}
      replace={replace}
      className="group block rounded-2xl p-2.5 -m-2.5 hover:bg-white/[0.03] transition-colors duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-bg-surface mb-3 border border-border-subtle group-hover:border-primary-500/30 group-hover:shadow-[0_0_20px_rgba(132,94,247,0.12)] transition-all duration-300">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-hover">
            <Users className="w-12 h-12 text-text-muted" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-primary-500/30">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-semibold text-text-primary truncate">
          {artist.name}
        </h3>
        <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1">
          <Users className="w-3.5 h-3.5" />
          {formatFollowers(artist.followers)}
        </p>
      </div>
    </Link>
  );
}

export default memo(ArtistCard);
