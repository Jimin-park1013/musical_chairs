"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:4000");

export default function RoomPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [startMessage, setStartMessage] = useState("");

  useEffect(() => {
    const storedNick = localStorage.getItem("nickname");
    if (!storedNick) {
      alert("請先從首頁輸入暱稱");
      router.push("/");
      return;
    }
    setNickname(storedNick);

    socket.emit("joinRoom", { roomId: "001", nickname: storedNick }, (success) => {
      if (!success) {
        alert("加入房間失敗");
        router.push("/");
        return;
      }
      setJoined(true);
    });

    socket.on("roomData", (data) => {
      setRoom(data);
      setIsHost(data.host === socket.id);
    });

    socket.on("errorMsg", (msg) => {
      alert(msg);
      router.push("/");
    });

    // 遊戲開始時 (可以跳轉或顯示訊息)
    socket.on("gameStarted", () => {
      router.push(`/game/${room.id}`);
    });

    return () => {
      socket.off("roomData");
      socket.off("errorMsg");
      socket.off("gameStarted");
    };
  }, [router]);

  const toggleReady = () => {
    if (!room) return;
    socket.emit("toggleReady", { roomId: room.id });
  };

  const allReady = room?.players?.every((p) => p.ready) ?? false;

  const startGame = () => {
    if (!allReady) {
      setStartMessage("所有玩家必須準備才能開始遊戲");
      setTimeout(() => setStartMessage(""), 3000);
      return;
    }
    socket.emit("startGame", { roomId: room.id });
  };

  if (!joined) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>加入中...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 700,
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center" }}>房間 {room.id}</h1>
      <p style={{ textAlign: "center", fontWeight: "bold" }}>
        容量：{room.players.length} / 20
      </p>
      {startMessage && (
        <p
          style={{
            color: "red",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          {startMessage}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {room.players.map((p) => {
          const isSelf = p.id === socket.id;
          const isHostPlayer = p.id === room.host;

          return (
            <div
              key={p.id}
              style={{
                border: isHostPlayer ? "2px solid #f39c12" : "1px solid #ccc",
                borderRadius: 8,
                padding: 12,
                backgroundColor: isSelf ? "#dff9fb" : "#f0f0f0",
                boxShadow: isHostPlayer ? "0 0 8px #f39c12" : "none",
                userSelect: "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  marginBottom: 6,
                }}
              >
                {p.nickname} {isHostPlayer && "(房主)"}
              </div>
              <div style={{ marginBottom: 6 }}>
                狀態：{" "}
                <span style={{ color: p.ready ? "green" : "red" }}>
                  {p.ready ? "已準備" : "未準備"}
                </span>
              </div>
              {isSelf && (
                <button
                  onClick={toggleReady}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    border: "none",
                    backgroundColor: p.ready ? "#27ae60" : "#2980b9",
                    color: "white",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  {p.ready ? "取消準備" : "準備"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isHost && room.players.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={startGame}
            disabled={!allReady}
            style={{
              padding: "10px 20px",
              fontSize: "1.1rem",
              backgroundColor: allReady ? "#e67e22" : "#ccc",
              border: "none",
              borderRadius: 6,
              cursor: allReady ? "pointer" : "not-allowed",
              color: "white",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
          >
            開始遊戲
          </button>
          {!allReady && (
            <p style={{ color: "red", marginTop: 8 }}>
              所有玩家必須準備才能開始
            </p>
          )}
        </div>
      )}
    </div>
  );
}
