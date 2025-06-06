"use client";

import { useRouter } from "next/navigation";

export default function Success() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#ECEAE1", // 勝利感淺色背景
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        fontFamily: "'Comic Sans MS', cursive",
        color: "#000", // 文字用黑色比較好看
        padding: "0 20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "64px",
          margin: 0,
          color: "#F7CB82", // 金黃色標題
          textShadow: "2px 2px 0 #A77653", // 帶點陰影感覺
        }}
      >
        🎉CONGRATULATION！🎉
      </h1>

      {/* 中間插入圖片 */}
      <img
        src="/images/success.png"
        alt="Success Illustration"
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
          textShadow: "1px 1px 3px rgba(0,0,0,0.15)",
          marginTop: "10px",
          marginBottom: 10,
          color: "#000",
        }}
      >
        你在 1 分鐘內成功存活，真厲害！
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
