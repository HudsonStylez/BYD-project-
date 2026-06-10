import React, { useState } from "react";
import { Star, MessageSquareCode, CheckCircle2, ThumbsUp } from "lucide-react";

interface Review {
  id: number;
  name: string;
  location: string;
  model: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
}

export const OwnerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      name: "Marcus Sterling",
      location: "Frankfurt, Germany",
      model: "BYD Seal (AWD Design)",
      rating: 5,
      date: "May 12, 2026",
      comment: "Absolutely outstanding engineering. The CTB cell layout makes the Seal handle curves like a dedicated racing machine. Range is extremely steady at 310+ miles in continuous 130 km/h highway conditions. Fast charging clears the 80% mark in roughly 29 minutes.",
      likes: 42
    },
    {
      id: 2,
      name: "Elena Rostova",
      location: "Sydney, Australia",
      model: "BYD Atto 3 (Extended)",
      rating: 5,
      date: "April 28, 2026",
      comment: "The rotating 15.6 inch dashboard tablet consolidated all child safety and climate configurations beautifully. Excellent acoustic isolation from outside city noise. Horizon Club provided smooth cryptographic reservation clearances.",
      likes: 19
    },
    {
      id: 3,
      name: "Dr. Kenji Takahashi",
      location: "Tokyo, Japan",
      model: "BYD Han (Flagship Elite)",
      rating: 5,
      date: "June 01, 2026",
      comment: "Unmatched executive cabin luxury. The real leather seating alignment, combined with dual-pane noise-canceling glasses, sets a new industry standard. Better response metrics than my former premium German performance sedans.",
      likes: 67
    }
  ]);

  const [likeStates, setLikeStates] = useState<Record<number, boolean>>({});

  const handleLike = (id: number) => {
    if (likeStates[id]) return; // Single-like limit
    setLikeStates((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  return (
    <section className="space-y-8">
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2">
          <span className="w-6 h-[1.5px] bg-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-[#00E5FF] uppercase">Horizon Testimonials</span>
          <span className="w-6 h-[1.5px] bg-cyan-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-sans font-light text-white tracking-tight">
          What <span className="font-semibold text-cyan-300">Club Members</span> Are Saying
        </h2>
        <p className="text-white/50 text-xs md:text-sm">
          Verified BYD owners and global cryptocurrency investors review our premium vehicle acquisitions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#1A1A1A]/85 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative"
          >
            <div className="space-y-4">
              {/* Star line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? "text-cyan-400 fill-cyan-400" : "text-white/10"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-cyan-300 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Owner</span>
                </div>
              </div>

              {/* Text Quote */}
              <p className="text-white/70 text-xs leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Profile line */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white text-sm">{rev.name}</h4>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{rev.location}</p>
                <p className="text-[10px] text-cyan-400 font-mono mt-1">{rev.model}</p>
              </div>

              {/* Likes counter button */}
              <button
                onClick={() => handleLike(rev.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all duration-300 ${
                  likeStates[rev.id]
                    ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300"
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{rev.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
