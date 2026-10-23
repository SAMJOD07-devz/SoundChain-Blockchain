import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Play, ArrowRight } from "lucide-react";
import { getAllTracks } from "../data/demoTracks";
import { StackedSplitBar } from "../components/StackedSplitBar";

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
    <div className="space-y-12 py-8">
      {/* Page Header (Editorial Ledger Title) */}
      <div className="border-b border-hairline pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="font-mono text-xs text-brass uppercase tracking-widest">
            // MASTERING ARCHIVE & CATALOG
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-paper tracking-tight">
            Discography Ledger
          </h1>
          <p className="text-ash text-sm max-w-lg">
            Direct audio lacquer transfers. Every playback simulation settles collaborator splits via on-chain contract logic.
          </p>
        </div>

        {/* Monospace Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ash absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search master, artist, catalog..."
            className="w-full bg-[#1A1814] border border-hairline rounded-sm pl-10 pr-9 py-2.5 text-xs text-paper placeholder-ash/60 focus:outline-none focus:border-brass transition-colors font-mono"
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
      <div className="flex items-center gap-6 border-b border-hairline pb-4 font-mono text-xs overflow-x-auto">
        <span className="text-ash/60 uppercase">Filter:</span>
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
              className="lg:col-span-7 bg-[#1A1814] border border-hairline hover:border-brass-dim p-8 rounded-sm space-y-6 transition-colors group"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-brass font-bold">
                  CATALOG NO. {filteredTracks[0].catalogNo}
                </span>
                <span className="text-ash">
                  {filteredTracks[0].duration} · {filteredTracks[0].bpm} BPM · {filteredTracks[0].genre}
                </span>
              </div>

              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-paper group-hover:text-brass transition-colors">
                  <Link to={`/track/${filteredTracks[0].id}`}>
                    {filteredTracks[0].title}
                  </Link>
                </h2>
                <p className="font-mono text-sm text-ash mt-1">
                  Artist: <span className="text-paper">{filteredTracks[0].artist}</span>
                </p>
              </div>

              <p className="text-sm text-ash leading-relaxed">
                {filteredTracks[0].description}
              </p>

              {/* Stacked Split Bar with inline percentage labels */}
              <div className="pt-6 border-t border-hairline space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-ash">
                  <span>ROYALTY DIVISION (10,000 BPS)</span>
                  <span className="text-paper">3 Collaborators</span>
                </div>
                <StackedSplitBar splits={filteredTracks[0].splits} />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Link
                  to={`/track/${filteredTracks[0].id}`}
                  className="px-5 py-2.5 bg-brass text-ink font-semibold text-xs rounded-sm hover:bg-brass-light transition-colors inline-flex items-center gap-2"
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
                    className="bg-[#1A1814] border border-hairline hover:border-brass-dim p-6 rounded-sm space-y-4 transition-colors group"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-ash">{track.catalogNo}</span>
                      <span className="text-ash">{track.duration} · {track.genre}</span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-paper group-hover:text-brass transition-colors">
                        <Link to={`/track/${track.id}`}>
                          {track.title}
                        </Link>
                      </h3>
                      <p className="font-mono text-xs text-ash mt-0.5">
                        {track.artist}
                      </p>
                    </div>

                    <p className="text-xs text-ash line-clamp-2">
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
                        className="font-mono text-xs text-brass hover:underline inline-flex items-center gap-1"
                      >
                        Inspect Ledger <ArrowRight className="w-3 h-3" />
                      </Link>
                      <span className="font-mono text-[10px] text-ash">
                        10,000 BPS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-hairline bg-[#1A1814] rounded-sm space-y-3">
          <p className="font-serif text-xl text-paper">No lacquer masters found</p>
          <p className="font-mono text-xs text-ash">
            No entries in the ledger matched "{searchQuery}". Try a different term or clear filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("All");
            }}
            className="mt-2 px-4 py-2 border border-hairline text-xs font-mono text-brass hover:border-brass"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
