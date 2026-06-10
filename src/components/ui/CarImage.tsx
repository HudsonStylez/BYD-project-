import React, { useState, useEffect } from "react";
import { carImageMap } from "../../data/carImages";

interface CarImageProps {
  model: string;
  className?: string; // Additional Tailwind styling classes
  alt?: string;
}

export const CarImage: React.FC<CarImageProps> = ({ model, className = "", alt = "" }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => carImageMap[model] || "https://images.unsplash.com/photo-1593941707882-5a12a2a9e72e?w=800&auto=format");
  const [fallbackLevel, setFallbackLevel] = useState(() => (carImageMap[model] ? 0 : 1));

  // Stay in sync if the model prop dynamically switches
  useEffect(() => {
    const primaryUrl = carImageMap[model];
    if (primaryUrl) {
      setImgSrc(primaryUrl);
      setFallbackLevel(0);
    } else {
      setImgSrc("https://images.unsplash.com/photo-1593941707882-5a12a2a9e72e?w=800&auto=format");
      setFallbackLevel(1);
    }
  }, [model]);

  const handleError = () => {
    if (fallbackLevel === 0) {
      // Tier 2: Fallback to active high-quality generic electric vehicle
      setImgSrc("https://images.unsplash.com/photo-1593941707882-5a12a2a9e72e?w=800&auto=format");
      setFallbackLevel(1);
    } else if (fallbackLevel === 1) {
      // Tier 3: Fallback to high-contrast sleek inline SVG vector placeholder
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
          <rect width="400" height="300" fill="#151515"/>
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#151515" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill="url(#glow)"/>
          <circle cx="200" cy="120" r="45" fill="none" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
          <text x="200" y="200" text-anchor="middle" fill="#FFFFFF" font-family="monospace" font-size="13" font-weight="bold" letter-spacing="1">${model.toUpperCase()}</text>
          <text x="200" y="222" text-anchor="middle" fill="#00E5FF" font-family="monospace" font-size="9" letter-spacing="2" opacity="0.8">BYD HORIZON SPEC</text>
          <path d="M140 240 L260 240 L240 248 L160 248 Z" fill="#00E5FF" opacity="0.25"/>
        </svg>
      `;
      setImgSrc(`data:image/svg+xml,${encodeURIComponent(svg.trim())}`);
      setFallbackLevel(2);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || model}
      className={`object-cover w-full h-full transition-all duration-500 ${className}`}
      onError={handleError}
      loading="lazy"
    />
  );
};
