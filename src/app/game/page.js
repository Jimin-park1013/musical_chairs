"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Game() {
  const canvasRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "easy";

  const [chairs, setChairs] = useState([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [clickAllowed, setClickAllowed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [countdown, setCountdown] = useState(3); // 3秒倒數

  const audioRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const musicStopTimerRef = useRef(null);
  const musicPositionRef = useRef(0);
  const startTimeRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const clickAllowedRef = useRef(false);
  const countdownTimerRef = useRef(null);

  // 各難度點擊反應時間 (ms)
  const difficultyTimeout = {
    easy: 1500,
    hard: 1000,
    hell: 700,
  }[mode];

  // 隨機產生椅子座標 (限制在 450x450 畫布內)
  const randomChair = () => ({
    x: Math.random() * 410 + 20,
    y: Math.random() * 410 + 20,
  });

  // 遊戲倒數3秒提示後開始
  const startGameWithCountdown = () => {
    setCountdown(3);
    setClickAllowed(false);
    clickAllowedRef.current = false;
    setMusicPlaying(false);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          startMusic();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 倒數計時 60秒
  const startCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
        router.push("/success");
      }
    }, 100);
  };

  // 播放音樂 + 隨機停止 + 椅子出現
  const startMusic = () => {
    const now = Date.now();
    if (startTimeRef.current && now - startTimeRef.current >= 60000) {
      router.push("/success");
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = now;
      setTimeLeft(60);
      startCountdown();
    }

    const newChairs = Array.from({ length: 1 }, () => randomChair());
    setChairs(newChairs);

    setClickAllowed(false);
    clickAllowedRef.current = false;

    if (audioRef.current) {
      audioRef.current.currentTime = musicPositionRef.current;
      audioRef.current.play().catch((err) => {
        console.warn("音樂播放被中斷或瀏覽器阻擋", err);
      });
    }

    setMusicPlaying(true);

    const randomTime = Math.random() * 5000 + 5000;
    musicStopTimerRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        musicPositionRef.current = audioRef.current.currentTime;
      }
      setMusicPlaying(false);
      setClickAllowed(true);
      clickAllowedRef.current = true;

      reactionTimerRef.current = setTimeout(() => {
        if (clickAllowedRef.current) {
          router.push("/gameover");
        }
      }, difficultyTimeout);
    }, randomTime);
  };

  // 點擊椅子判斷
  const handleCanvasClick = (e) => {
    if (!clickAllowedRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clickedChair = chairs.find(
      (chair) =>
        clickX > chair.x &&
        clickX < chair.x + 40 &&
        clickY > chair.y &&
        clickY < chair.y + 40
    );

    if (clickedChair) {
      clearTimeout(reactionTimerRef.current);
      setClickAllowed(false);
      clickAllowedRef.current = false;

      startMusic();
    }
  };

  // 畫布與椅子渲染
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const chairImg = new Image();
      chairImg.src = "/images/chair.png"; // 椅子圖

      chairImg.onload = () => {
        const draw = () => {
          ctx.clearRect(0, 0, 450, 450);

          // 遊戲區域底色，與背景分開，畫布顏色
          ctx.fillStyle = "#ECEAE1"; // 遊戲區背景色
          ctx.fillRect(0, 0, 450, 450);

          if (!musicPlaying && clickAllowed) {
            chairs.forEach((chair) => {
              ctx.save();
              ctx.translate(chair.x + 20, chair.y + 20);
              ctx.rotate((-5 * Math.PI) / 180);
              ctx.drawImage(chairImg, -20, -20, 40, 40);
              ctx.restore();
            });
          }
        };

        draw();
      };
    }
  }, [chairs, musicPlaying, clickAllowed]);

  // 音樂初始化
  useEffect(() => {
    audioRef.current = new Audio("/audio/bgm.mp3");
    audioRef.current.loop = false;
    audioRef.current.currentTime = 73;
    musicPositionRef.current = 73;

    startGameWithCountdown();

    return () => {
      if (audioRef.current) audioRef.current.pause();
      clearTimeout(musicStopTimerRef.current);
      clearTimeout(reactionTimerRef.current);
      clearInterval(countdownIntervalRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundImage: "url('/images/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 進度條 */}
      <div
        style={{
          position: "relative",
          width: 500,
          height: 30,
          border: "4px solid #333", // 粗一點
          borderRadius: 15,
          overflow: "hidden",
          backgroundColor: "#ddd",
          marginBottom: 20,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: `${(timeLeft / 60) * 100}%`,
            height: "100%",
            backgroundColor: "#788DAC",
            transition: "width 0.1s linear",
          }}
        />
        {/* 小球在進度條內 */}
        <img
          src="/images/ball.png"
          alt="ball"
          style={{
            position: "absolute",
            top: "50%",
            left: `calc(${(timeLeft / 60) * 100}% - 15px)`,
            transform: "translateY(-50%)",
            width: 30,
            height: 30,
            pointerEvents: "none",
            transition: "left 0.1s linear",
          }}
        />
      </div>

      {/* 倒數3秒提示 */}
      {countdown > 0 && (
        <h1 style={{ color: "#fff", marginBottom: 20, zIndex: 10 }}>
          遊戲即將開始：{countdown}
        </h1>
      )}

      {/* 提示 */}
      {countdown === 0 && (
        <h2 style={{ zIndex: 10, color: "#fff", margin: 10 }}>
          {musicPlaying
            ? "🎶 音樂播放中…"
            : clickAllowed
            ? `🔥 點椅子！(${(difficultyTimeout / 1000).toFixed(2)} 秒內)`
            : ""}
        </h2>
      )}

      {/* 畫布（遊戲區） */}
      <canvas
        ref={canvasRef}
        width={450}
        height={450}
        onClick={handleCanvasClick}
        style={{
          borderRadius: 10,
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          cursor: clickAllowed ? "pointer" : "default",
          zIndex: 10,
          backgroundColor: "#ECEAE1",
        }}
      />
    </div>
  );
}

