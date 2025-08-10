"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player })),
  { ssr: false }
);

interface LottieLoadingProps {
  size?: number;
  className?: string;
  message?: string;
  speed?: number;
  variant?: "default" | "primary" | "secondary" | "muted";
}

export default function LottieLoading({
  size = 170,
  className = "",
  message,
  speed = 1,
  variant = "default",
}: LottieLoadingProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timeout = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const getSpinnerClasses = () => {
    const baseClasses = "animate-spin rounded-full border-4";
    switch (variant) {
      case "primary":
        return `${baseClasses} border-primary/20 border-t-primary`;
      case "secondary":
        return `${baseClasses} border-secondary/20 border-t-secondary`;
      case "muted":
        return `${baseClasses} border-muted border-t-muted-foreground`;
      default:
        return `${baseClasses} border-muted border-t-primary`;
    }
  };

  const getMessageClasses = () => {
    switch (variant) {
      case "primary":
        return "text-primary text-sm text-center";
      case "secondary":
        return "text-secondary-foreground text-sm text-center";
      case "muted":
        return "text-muted-foreground text-sm text-center";
      default:
        return "text-muted-foreground text-sm text-center";
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (showFallback || !isClient) {
    return (
      <div
        className={`flex flex-col items-center h-full -mt-10 justify-center space-y-3 ${className}`}
      >
        <div className={getSpinnerClasses()} style={{ width: size * 0.6, height: size * 0.6 }} />
        {message && <p className={getMessageClasses()}>{message}</p>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center h-full justify-center space-y-3 -mt-10 ${className}`}
    >
      <Player
        autoplay
        loop
        src="/Loading.json"
        style={{ height: size, width: size }}
        speed={speed}
      />
      {message && <p className={getMessageClasses()}>{message}</p>}
    </div>
  );
}
