"use client";

import { useEffect, useRef, useState } from "react";
import mainImage from "../assets/mainImage.jpeg";

type Hotspot = {
  id: string;
  videoSrc: string;
  buttonLabel: string;
  top: string;
  left: string;
};

type HotspotPosition = {
  top: string;
  left: string;
};

const hotspotPositions: Record<string, HotspotPosition> = {
  // Adjust these percentage values to move each video button.
  hotspot1: { top: "76%", left: "21%" },
  hotspot2: { top: "76%", left: "35%" },
  hotspot3: { top: "76%", left: "55%" },
  hotspot4: { top: "76%", left: "70.5%" }
};

const hotspots: Hotspot[] = [
  {
    id: "hotspot-1",
    videoSrc: "/api/media/01.mp4",
    buttonLabel: "Open video 1",
    ...hotspotPositions.hotspot1
  },
  {
    id: "hotspot-2",
    videoSrc: "/api/media/02.mp4",
    buttonLabel: "Open video 2",
    ...hotspotPositions.hotspot2
  },
  {
    id: "hotspot-3",
    videoSrc: "/api/media/03.mp4",
    buttonLabel: "Open video 3",
    ...hotspotPositions.hotspot3
  },
  {
    id: "hotspot-4",
    videoSrc: "/api/media/04.mp4",
    buttonLabel: "Open video 4",
    ...hotspotPositions.hotspot4
  }
];

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0
  });
  const [activeVideo, setActiveVideo] = useState<Hotspot | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isClosingVideo, setIsClosingVideo] = useState(false);

  useEffect(() => {
    if (!activeVideo || !videoRef.current) {
      return;
    }

    videoRef.current.currentTime = 0;
    setIsPaused(false);

    void videoRef.current.play().catch(() => {
      setIsPaused(true);
    });
  }, [activeVideo]);

  useEffect(() => {
    if (!activeVideo) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeVideo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideo]);

  const openVideo = (hotspot: Hotspot) => {
    setIsClosingVideo(false);
    setActiveVideo(hotspot);
  };

  const closeVideo = () => {
    if (!activeVideo || isClosingVideo) {
      return;
    }

    if (videoRef.current) {
      videoRef.current.pause();
    }

    setIsClosingVideo(true);
  };

  const handlePlayerShellAnimationEnd = () => {
    if (!isClosingVideo) {
      return;
    }

    setActiveVideo(null);
    setIsPaused(false);
    setIsClosingVideo(false);
  };

  const togglePlayback = () => {
    if (!videoRef.current) {
      return;
    }

    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPaused(false);
      return;
    }

    videoRef.current.pause();
    setIsPaused(true);
  };

  const scrollToStart = () => {
    sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

    if (horizontalDelta === 0) {
      return;
    }

    event.preventDefault();
    slider.scrollLeft += horizontalDelta;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: slider.scrollLeft
    };

    slider.classList.add("isDragging");
    slider.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const dragState = dragStateRef.current;

    if (!slider || !dragState.isDragging || dragState.pointerId !== event.pointerId) {
      return;
    }

    const dragDistance = event.clientX - dragState.startX;
    slider.scrollLeft = dragState.startScrollLeft - dragDistance;
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    const dragState = dragStateRef.current;

    if (!slider || !dragState.isDragging || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = {
      isDragging: false,
      pointerId: -1,
      startX: 0,
      startScrollLeft: 0
    };

    slider.classList.remove("isDragging");

    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <main className="page">
      <div className="deviceShell">
        <div className="deviceBezel" />

        <section
          ref={sliderRef}
          className="slider"
          aria-label="Interactive story slider"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={stopDragging}
        >
          <div className="imageTrack">
            <img
              className="mainImage"
              src={mainImage.src}
              alt="Interactive main image"
              draggable={false}
            />

            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                className="hotspot"
                style={{ top: hotspot.top, left: hotspot.left }}
                aria-label={hotspot.buttonLabel}
                onClick={() => openVideo(hotspot)}
              >
                <span className="hotspotInner" />
              </button>
            ))}

            <button type="button" className="returnButton returnButtonInline" onClick={scrollToStart}>
              Return to Start
            </button>
          </div>
        </section>

        {activeVideo ? (
          <div
            className={`playerOverlay ${isClosingVideo ? "isClosing" : ""}`}
            role="dialog"
            aria-modal="true"
          >
            <div
              className={`playerShell ${isClosingVideo ? "isClosing" : ""}`}
              onAnimationEnd={handlePlayerShellAnimationEnd}
            >
              <video
                ref={videoRef}
                key={activeVideo.videoSrc}
                className="playerVideo"
                src={activeVideo.videoSrc}
                playsInline
                controls={false}
                onPause={() => setIsPaused(true)}
                onPlay={() => setIsPaused(false)}
              />

              <div className="playerControls">
                <button type="button" className="playerButton" onClick={togglePlayback}>
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button type="button" className="playerButton playerButtonClose" onClick={closeVideo}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
