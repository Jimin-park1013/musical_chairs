"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  isHost: boolean;
  onMusicStop: () => void;
  startTrigger: boolean; // 每輪遊戲開始的觸發器
};

const GameMusicController = ({ isHost, onMusicStop, startTrigger }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHost || !startTrigger) return;

    if (audioRef.current) {
      // 隨機秒數 5~15 秒
      const randomDuration = Math.floor(Math.random() * 11) + 5;
      console.log("🎵 音樂播放秒數:", randomDuration);

      // 播放音樂，保證從頭開始
      audioRef.current.currentTime = 0;
      audioRef.current.play();

      // 定時停止音樂
      timeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        console.log("🎵 音樂停止！");
        onMusicStop();
      }, randomDuration * 1000);
    }

    // 清除舊的 timeout 避免重複
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHost, startTrigger, onMusicStop]);

  return (
    <div>
      <audio ref={audioRef} src="/audio/bgm.mp3" preload="auto" />
    </div>
  );
};

export default GameMusicController;
