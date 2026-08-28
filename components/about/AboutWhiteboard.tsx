"use client";

import { useState, useCallback, useEffect } from "react";
import type { AboutData } from "@/types/about";
import WhiteboardSurface from "./whiteboard/WhiteboardSurface";
import WhiteboardFront from "./whiteboard/WhiteboardFront";
import WhiteboardBack from "./whiteboard/WhiteboardBack";

interface AboutWhiteboardProps {
  about: AboutData;
}

export default function AboutWhiteboard({ about }: AboutWhiteboardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard shortcut listener (pressing 'f' or 'F' flips the whiteboard unless typing in input)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === "f" || e.key === "F") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        setIsFlipped((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="whiteboard-root relative flex flex-col justify-center">
      {/* SCREEN READER ANNOUNCEMENT REGION */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isFlipped
          ? "Now viewing side B: Living Pulse, current reading, and field notes."
          : "Now viewing side A: Personal story, making, and mountain roots."}
      </div>

      {/* TACTILE 3D WHITEBOARD SURFACE */}
      <WhiteboardSurface
        isFlipped={isFlipped}
        onToggleFlip={toggleFlip}
        frontContent={<WhiteboardFront about={about} />}
        backContent={<WhiteboardBack about={about} />}
      />
    </div>
  );
}
