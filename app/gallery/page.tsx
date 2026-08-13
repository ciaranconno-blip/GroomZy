"use client";

import { useState } from "react";
import { Plus, ImageIcon } from "lucide-react";

type Tag = "before" | "after";
type BreedSize = "small" | "large";

interface GalleryPhoto {
  id: string;
  tag: Tag;
  size: BreedSize;
  caption: string;
  gradient: string;
}

// Placeholder tiles, not real photos — TODO: wire to Firebase Storage uploads
// once the groomer starts adding real before/after shots.
const PLACEHOLDER_PHOTOS: GalleryPhoto[] = [
  { id: "1", tag: "before", size: "large", caption: "Husky, matted coat", gradient: "from-slate-700 to-slate-900" },
  { id: "2", tag: "after", size: "large", caption: "Husky, de-shed & tidy", gradient: "from-indigo-600 to-purple-800" },
  { id: "3", tag: "before", size: "small", caption: "Shih Tzu, overgrown", gradient: "from-slate-700 to-slate-900" },
  { id: "4", tag: "after", size: "small", caption: "Shih Tzu, full groom", gradient: "from-indigo-600 to-purple-800" },
  { id: "5", tag: "after", size: "large", caption: "Golden Retriever, bath & tidy", gradient: "from-indigo-600 to-purple-800" },
  { id: "6", tag: "before", size: "small", caption: "Cavapoo, matted ears", gradient: "from-slate-700 to-slate-900" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "before", label: "Before" },
  { id: "after", label: "After" },
  { id: "small", label: "Small Breed" },
  { id: "large", label: "Large Breed" },
] as const;

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const filtered = PLACEHOLDER_PHOTOS.filter((p) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "before" || activeFilter === "after") return p.tag === activeFilter;
    return p.size === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Gallery</h1>
        <p className="text-xs text-white/50">Real transformations from real Ballinasloe dogs.</p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`pill flex-shrink-0 ${activeFilter === f.id ? "active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((photo) => (
          <div key={photo.id} className="glass-card overflow-hidden">
            <div className={`h-32 sm:h-40 bg-gradient-to-br ${photo.gradient} flex items-center justify-center`}>
              <ImageIcon className="w-6 h-6 text-white/30" />
            </div>
            <div className="p-2.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  photo.tag === "before" ? "bg-white/10 text-white/60" : "bg-indigo-500/20 text-indigo-300"
                }`}
              >
                {photo.tag}
              </span>
              <p className="text-[11px] text-white/60 mt-1.5">{photo.caption}</p>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="glass-card border-dashed flex flex-col items-center justify-center gap-2 h-full min-h-[9rem] text-white/40 hover:text-white/70 hover:border-indigo-400/40 transition-colors"
        >
          <Plus className="w-6 h-6" />
          <span className="text-[11px] font-medium">Add Photo</span>
        </button>
      </div>
    </div>
  );
}
