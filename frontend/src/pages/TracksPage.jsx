import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Play, ArrowRight } from "lucide-react";
import { getAllTracks } from "../data/demoTracks";
import { StackedSplitBar } from "../components/StackedSplitBar";
import { TrackCoverArt } from "../components/TrackCoverArt";

export function TracksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [hoveredId, setHoveredId] = useState(null);

  const allTracks = getAllTracks();
  const dynamicGenres = ["All", ...Array.from(new Set(allTracks.map((t) => t.genre).filter(Boolean)))];

  const filteredTracks = allTracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.genre && t.genre.toLowerCase().includes(q)) ||
      (t.album && t.album.toLowerCase().includes(q));

    const matchesGenre = selectedGenre === "All" || (t.genre && t.genre.toLowerCase() === selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-10 py-8 pb-28">
      {/* Page Header (Editorial Ledger Title) */}
      <div className="border-b border-hairline pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <p className="text-brass text-xs font-semibold uppercase tracking-wider font-sans">
            Mastering Archive & Catalog
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-paper tracking-tight">
            Discography Ledger
          </h1>
          <p className="text-ash text-sm max-w-lg font-sans">
            Direct audio lacquer transfers. Every playback simulation settles collaborator splits via on-chain contract logic.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ash absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search master, artist, catalog..."
            className="w-full bg-[#1A1814] border border-hairline rounded-sm pl-10 pr-9 py-2.5 text-xs text-paper placeholder-ash/60 focus:outline-none focus:border-brass transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-ash hover:text-paper"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editorial Genre Filter Ticker */}
      <div className="flex items-center gap-6 border-b border-hairline pb-4 text-xs overflow-x-auto font-sans">
        <span className="text-ash/60 uppercase font-medium text-[11px]">Filter:</span>
        {dynamicGenres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`pb-1 transition-colors whitespace-nowrap ${
                isActive
                  ? "text-brass border-b-2 border-brass font-semibold"
                  : "text-ash hover:text-paper"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Asymmetric Editorial Catalog Layout */}
      {filteredTracks.length > 0 ? (
        <div className="space-y-8">
          {/* Main Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Prominent Featured Master (7 cols) */}
            <div
              onMouseEnter={() => setHoveredId(filteredTracks[0].id)}
              onMouseLeave={() => setHoveredId(null)}
              className="lg:col-span-7 bg-[#1A1814] border border-hairline hover:border-brass/40 p-8 rounded-sm space-y-6 transition-colors group shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-brass font-bold font-mono">
                  CATALOG NO. {filteredTracks[0].catalogNo}
                </span>
                <span className="text-ash font-mono text-[11px]">
                  {filteredTracks[0].duration} · {filteredTracks[0].bpm} BPM · {filteredTracks[0].genre}
                </span>
              </div>

              <div className="flex items-start gap-5">
                <TrackCoverArt trackId={filteredTracks[0].id} size={92} showGrooves={true} className="shrink-0" />
                <div className="flex-1 space-y-1">
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-paper group-hover:text-brass transition-colors leading-tight">
                    <Link to={`/track/${filteredTracks[0].id}`}>
                      {filteredTracks[0].title}
                    </Link>
                  </h2>
                  <p className="text-sm text-ash font-sans">
                    Artist: <span className="text-paper font-semibold">{filteredTracks[0].artist}</span>
                  </p>
                </div>
              </div>

              <p className="text-sm text-ash leading-relaxed font-sans">
                {filteredTracks[0].description}
              </p>

              {/* Stacked Split Bar with inline percentage labels */}
              <div className="pt-6 border-t border-hairline space-y-2">
                <div className="flex items-center justify-between text-xs text-ash font-sans">
                  <span className="uppercase text-[11px] tracking-wide font-medium">Royalty Division (10,000 BPS)</span>
                  <span className="text-paper font-mono text-[11px]">3 Collaborators</span>
                </div>
                <StackedSplitBar splits={filteredTracks[0].splits} />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Link
                  to={`/track/${filteredTracks[0].id}`}
                  className="px-5 py-2.5 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-2 font-sans"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Track Simulator</span>
                </Link>
                <span className="font-mono text-[11px] text-ash">
                  Contract: 0x5FbD...0aa3
                </span>
              </div>
            </div>

            {/* Side Column Flanking Tracks (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {filteredTracks.slice(1).map((track) => {
                const isHovered = hoveredId === track.id;
                return (
                  <div
                    key={track.id}
                    onMouseEnter={() => setHoveredId(track.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="bg-[#1A1814] border border-hairline hover:border-brass/40 p-6 rounded-sm space-y-4 transition-colors group shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-brass font-medium">{track.catalogNo}</span>
                      <span className="text-ash text-[11px]">{track.duration} · {track.genre}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <TrackCoverArt trackId={track.id} size={52} showGrooves={false} className="shrink-0" />
                      <div>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-paper group-hover:text-brass transition-colors">
                          <Link to={`/track/${track.id}`}>
                            {track.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-ash mt-0.5 font-sans">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-ash line-clamp-2 font-sans">
                      {track.description}
                    </p>

                    {/* Stacked Split Bar */}
                    <div className="pt-3 border-t border-hairline space-y-1.5">
                      <StackedSplitBar
                        splits={track.splits}
                        showLabels={isHovered}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        to={`/track/${track.id}`}
                        className="text-xs text-brass hover:text-brass-light flex items-center gap-1 font-sans font-medium"
                      >
                        <span>Inspect Master</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <span className="font-mono text-[10px] text-ash/70">
                        {track.splits?.length || 2} Payees
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-hairline bg-[#1A1814] rounded-sm space-y-3">
          <p className="font-serif text-xl text-paper">No tracks matched your search.</p>
          <p className="text-xs text-ash font-sans">Try searching by artist name, genre, or catalog number.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("All");
            }}
            className="px-4 py-2 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light font-sans mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
