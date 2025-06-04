"use client";
import { useEffect, useRef } from "react";

type Props = {
  isHost: boolean;
  onMusicStop: () => void;
  startTrigger: boolean;
};

const GameMusicController = ({ isHost, onMusicStop, startTrigger }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHost || !startTrigger || !audioRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const randomDuration = Math.floor(Math.random() * 11) + 5;
    console.log("🎵 音樂播放秒數:", randomDuration);

    audioRef.current.currentTime = 0;
    audioRef.current.muted = false;
    audioRef.current.play()
      .then(() => console.log("✅ 音樂播放成功"))
      .catch((e) => console.error("❌ 音樂播放失敗", e));

    timeoutRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      onMusicStop();
    }, randomDuration * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isHost, startTrigger]);

  return <audio ref={audioRef} src="/audio/bgm.mp3" preload="auto" />;
};

export default GameMusicController;
