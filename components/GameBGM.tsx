"use client";

import { useEffect, useRef } from "react";

const GameBGM = ({ play }: { play: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (play) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [play]);

  return <audio ref={audioRef} src="/audio/bgm.mp3" />;
};

export default GameBGM;
