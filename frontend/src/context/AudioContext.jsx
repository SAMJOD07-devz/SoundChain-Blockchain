import React, { createContext, useContext, useState, useEffect } from "react";
import { DEMO_TRACKS } from "../data/demoTracks";
import { audioSynth } from "../utils/audioSynth";

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Play a specific track or toggle current
  const playTrack = (track) => {
    if (!track) return;
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
      return;
    }

    setCurrentTrack(track);
    setDuration(track.durationSec || 220);
    setIsPlaying(true);
    audioSynth.playTrack(track.id);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      setIsPlaying(true);
      audioSynth.playTrack(currentTrack.id);
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    audioSynth.stop();
  };

  const closePlayer = () => {
    pauseTrack();
    setCurrentTrack(null);
    setCurrentTime(0);
  };

  const changeVolume = (val) => {
    setVolume(val);
    audioSynth.setVolume(val);
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = DEMO_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = (currentIndex + 1) % DEMO_TRACKS.length;
    playTrack(DEMO_TRACKS[nextIdx]);
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = DEMO_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (currentIndex - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length;
    playTrack(DEMO_TRACKS[prevIdx]);
  };

  // Progress timer loop when playing
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, currentTrack]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        playTrack,
        togglePlay,
        pauseTrack,
        closePlayer,
        changeVolume,
        nextTrack,
        prevTrack,
        setCurrentTime,
        audioSynth,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
