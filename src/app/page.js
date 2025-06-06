"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();

  const startGame = (mode) => {
    router.push(`/game?mode=${mode}`);
  };

  return (
    <div style={{
      height: "100vh",
      backgroundImage: "url('/images/bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 30,
      fontFamily: "'Comic Sans MS', 'cursive'",
      padding: "0 20px",
    }}>
      {/* 標題區 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <img 
          src="/images/chair.png" 
          alt="椅子" 
          style={{ width: "48px", transform: "rotate(-5deg)" }}
        />
        <h1 style={{
          fontSize: "48px",
          color: "#F7CB82",
          textShadow: "2px 2px #A77653",
          margin: 0,
        }}>
          椅子大風吹
        </h1>
        <img 
          src="/images/chair.png" 
          alt="椅子" 
          style={{ width: "48px", transform: "rotate(-5deg)" }}
        />
      </div>

      {/* 規則文字 */}
      <p style={{
        maxWidth: "480px",
        color: "#fff",
        textAlign: "center",
        fontSize: "16px",
        lineHeight: 1.5,
        textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
        marginTop: "-10px",
      }}>
        當音樂停止時，快速搶坐椅子！                           
         </p>
      <p style={{
        maxWidth: "480px",
        color: "#fff",
        textAlign: "center",
        fontSize: "16px",
        lineHeight: 1.5,
        textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
        marginTop: "-10px",
      }}>
        遊戲規則：音樂隨機暫停，在難度挑戰秒數內點選椅子，撐過一分鐘的玩家獲勝。挑戰三種難度，測試你的反應力！
      </p>


      <div style={{ display: "flex", gap: 60, marginTop: 20 }}>
        {/* 簡單模式 */}
        <ModeButton
          bgColor="#F7CB82"
          onClick={() => startGame("easy")}
          label="簡單"
          flames={1}
        />

        {/* 困難模式 */}
        <ModeButton
          bgColor="#D58E66"
          onClick={() => startGame("hard")}
          label="困難"
          flames={2}
        />

        {/* 地獄模式 */}
        <ModeButton
          bgColor="#A77653"
          onClick={() => startGame("hell")}
          label="地獄"
          flames={3}
        />
      </div>

      <img
        src="/images/chair.png"
        alt="可愛小椅子"
        style={{
          marginTop: 40,
          width: "140px",
          transform: "rotate(-5deg)",
          borderRadius: "12px",
        }}
      />
    </div>
  );
}

// 模式按鈕元件，帶火焰難度標示和 hover 效果
function ModeButton({ bgColor, onClick, label, flames }) {
  const [hover, setHover] = useState(false);

  // 製作火焰 emoji 字串
  const flameString = "🔥".repeat(flames);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: bgColor,
        borderRadius: 20,
        border: "none",
        width: 140,
        height: 140,
        cursor: "pointer",
        boxShadow: hover ? "0 8px 15px rgba(0,0,0,0.3)" : "0 4px 6px rgba(0,0,0,0.2)",
        transform: hover ? "scale(1.1)" : "scale(1)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        userSelect: "none",
        textShadow: "none",
        padding: "10px",
      }}
    >
      {/* 火焰難度列 */}
      <div style={{ fontSize: 28, marginBottom: 8 }}>{flameString}</div>

      {label}
    </button>
  );
}
