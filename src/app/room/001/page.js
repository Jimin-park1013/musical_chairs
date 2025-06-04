"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:4000");

// 假設 server 給你的 room 物件裡面的 players 是這種格式
// {
//   id: "socketid or fakeid",
//   nickname: "玩家名稱",
//   ready: true/false
// }

export default function RoomPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(true); // 先假設你是房主方便測試
  const [startMessage, setStartMessage] = useState("");

  useEffect(() => {
    const storedNick = localStorage.getItem("nickname");
    if (!storedNick) {
      alert("請先從首頁輸入暱稱");
      return;
    }
    setNickname(storedNick);

    // 假設 server 傳來的房間資料格式是這樣，我們先模擬一下room內容
    const fakePlayers = Array.from({ length: 20 }, (_, i) => ({
      id: `bot-${i + 1}`,
      nickname: `模擬玩家${i + 1}`,
      ready: true, // 模擬玩家全準備好了
    }));

    // 再加上自己這個玩家
    const selfPlayer = {
      id: "me",
      nickname: storedNick,
      ready: true, // 預設自己也準備好了
    };

    // 先模擬一個房間物件
    const fakeRoom = {
      id: "001",
      host: "me", // 你是房主
      players: [selfPlayer, ...fakePlayers],
    };

    setRoom(fakeRoom);
    setJoined(true);

    // 真實情況下要打開 socket 連線與事件綁定
    // socket.on("roomUpdate", (updatedRoom) => {
    //   setRoom(updatedRoom);
    //   setIsHost(updatedRoom.host === socket.id);
    // });

    // socket.emit("joinRoom", { nickname: storedNick }, ({ success, room, hostId }) => {
    //   if (success) {
    //     setRoom(room);
    //     setJoined(true);
    //     setIsHost(hostId === socket.id);
    //   } else {
    //     alert("加入房間失敗");
    //   }
    // });

    // return () => {
    //   socket.off("roomUpdate");
    // };
  }, []);

  if (!joined) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>加入中...</h2>
      </div>
    );
  }

  // 自己點準備的切換
  const toggleReady = () => {
    // 在真實情況會發送 socket.emit("toggleReady")
    // 這裡直接在本地更新狀態模擬切換
    const updatedPlayers = room.players.map((p) => {
      if (p.id === "me") {
        return { ...p, ready: !p.ready };
      }
      return p;
    });

    setRoom({ ...room, players: updatedPlayers });
  };

  // 確認所有玩家是否都準備好了
  const allReady = room.players.every((p) => p.ready);

  const startGame = () => {
    if (!allReady) {
      setStartMessage("所有玩家必須準備才能開始遊戲");
      setTimeout(() => setStartMessage(""), 3000);
      return;
    }
    alert("遊戲開始！");
    // 這裡可觸發真正的遊戲開始邏輯，例如跳頁或顯示遊戲畫面
    router.push("/game/001"); // 開始遊戲就跳頁
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>房間 {room.id}</h1>
      <p style={{ textAlign: "center", fontWeight: "bold" }}>
        容量：{room.players.length} / 40
      </p>
      {startMessage && (
        <p style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
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
          const isSelf = p.id === "me";
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
              <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: 6 }}>
                {p.nickname} {isHostPlayer && "(房主)"}
              </div>
              <div style={{ marginBottom: 6 }}>
                狀態：<span style={{ color: p.ready ? "green" : "red" }}>{p.ready ? "已準備" : "未準備"}</span>
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
