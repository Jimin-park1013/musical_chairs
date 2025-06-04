"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function GameLobby() {
  const [nickname, setNickname] = useState("");
  const [rooms, setRooms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("nickname") || "";
    setNickname(storedName);

    socket.emit("getRoomList");

    socket.on("roomList", (updatedRooms) => {
      setRooms(updatedRooms);
    });

    return () => {
      socket.off("roomList");
    };
  }, []);

  const handleJoinRoom = (roomId) => {
    if (!nickname) {
      alert("請先輸入暱稱");
      return;
    }
    socket.emit("joinRoom", { nickname, roomId }, (success) => {
      if (success) {
        router.push(`/room/${roomId}`);
      } else {
        alert("加入房間失敗，可能已滿或已在房間內");
      }
    });
  };

  const handleAddFakePlayers = (e, roomId) => {
    e.stopPropagation();
    socket.emit("addFakePlayers", roomId);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>🎐 Wind Game 大廳</h1>
      <p style={{ textAlign: "center" }}>Welcome! {nickname}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.5rem",
          maxWidth: "600px",
          margin: "2rem auto",
        }}
      >
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleJoinRoom(room.id)}
            style={{
              border: "2px solid #0070f3",
              borderRadius: "12px",
              padding: "1.5rem",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgb(0 112 243 / 0.2)",
              textAlign: "center",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h2 style={{ margin: "0 0 0.5rem" }}>房間 {room.id}</h2>
            <p style={{ margin: "0.5rem 0" }}>人數：{room.players.length}</p>
            <p style={{ margin: 0, fontWeight: "bold" }}>
              房主：{room.host ? room.host : "尚無房主"}
            </p>
            <button
              onClick={(e) => handleAddFakePlayers(e, room.id)}
              style={{
                marginTop: "0.5rem",
                padding: "0.25rem 0.5rem",
                border: "none",
                backgroundColor: "#28a745",
                color: "#fff",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              +20 假玩家
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
