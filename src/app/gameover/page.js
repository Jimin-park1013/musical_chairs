"use client";

import { useRouter } from "next/navigation";

export default function GameOver() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#2f2f2f", // 深灰色背景
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 20, // 縮小間距
        fontFamily: "'Comic Sans MS', cursive",
        color: "#fff", // 白色字
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "64px",
          margin: 0,
          color: "#fff",
          textShadow: "2px 2px 0 #000", // 黑色陰影
        }}
      >
        💀 Game Over 💀
      </h1>

      {/* 中間插入圖片 */}
      <img
        src="/images/gameover.png"
        alt="Game Over Illustration"
        style={{
          width: "180px",
          maxWidth: "80vw",
          objectFit: "contain",
          margin: "0 auto",
        }}
      />

      <p
        style={{
          fontSize: "20px",
          maxWidth: "480px",
          textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
          marginTop: "10px",
          marginBottom: 10, // 文字跟按鈕間距調窄
        }}
      >
        你沒坐到椅子，被淘汰啦！Loser~~~
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          fontSize: 24,
          padding: "12px 24px",
          borderRadius: 20,
          border: "none",
          backgroundColor: "#788DAC",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          transition: "transform 0.3s ease, background-color 0.3s ease",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#6a7fbb";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#788DAC";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        回首頁
      </button>
    </div>
  );
}
