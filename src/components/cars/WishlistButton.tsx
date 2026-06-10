import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  carId: number;
  className?: string;
  id?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ carId, className = "", id }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("byd_horizon_token");

  useEffect(() => {
    if (!token) {
      // Guest local-storage synchronization
      const localWishlist = JSON.parse(localStorage.getItem("byd_horizon_guest_wishlist") || "[]");
      setIsWishlisted(localWishlist.includes(carId));
      return;
    }

    // Authenticated session synchronization
    const fetchWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const list = await response.json();
          setIsWishlisted(list.includes(carId));
        }
      } catch (err) {
        console.error("Failed to sync authenticated wishlist:", err);
      }
    };

    fetchWishlist();
  }, [carId, token]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);

    if (!token) {
      // Guest local storage fallback
      const localWishlist = JSON.parse(localStorage.getItem("byd_horizon_guest_wishlist") || "[]");
      let updatedWishlist: number[];
      if (localWishlist.includes(carId)) {
        updatedWishlist = localWishlist.filter((id: number) => id !== carId);
        setIsWishlisted(false);
      } else {
        updatedWishlist = [...localWishlist, carId];
        setIsWishlisted(true);
      }
      localStorage.setItem("byd_horizon_guest_wishlist", JSON.stringify(updatedWishlist));
      setLoading(false);
      // Dispatch a state refresh event for multi-component awareness
      window.dispatchEvent(new Event("wishlist-updated"));
      return;
    }

    // Authenticated dispatch
    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const response = await fetch(`/api/wishlist/${carId}`, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    } catch (err) {
      console.error("Wishlist operation issue:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform active:scale-95 ${
        isWishlisted
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          : "bg-[#1A1A1A]/85 text-white/60 border border-white/10 hover:text-white hover:border-white/20 hover:bg-[#1A1A1A]/95"
      } ${className}`}
      aria-label="Add to wishlist"
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-300 ${isWishlisted ? "fill-cyan-400 scale-110" : "scale-100"}`}
      />
    </button>
  );
};
