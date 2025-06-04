"use client";

import { useEffect, useState, useRef } from "react";
import GameMusicController from "../../../components/GameMusicController";

const CHAIR_COUNT_START = 20;
const PLAYER_AREA_WIDTH = 600;
const PLAYER_AREA_HEIGHT = 400;
const CHAIR_SIZE = 60;

function getRandomPosition(existingPositions, width, height, size) {
  const maxAttempts = 100;
  let attempt = 0;
  while (attempt < maxAttempts) {
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);
    const overlapped = existingPositions.some(
      (pos) => Math.abs(pos.x - x) < size && Math.abs(pos.y - y) < size
    );
    if (!overlapped) return { x, y };
    attempt++;
  }
  return {
    x: Math.random() * (width - size),
    y: Math.random() * (height - size),
  };
}

export default function GamePage({ players = [], onGameEnd }) {
  const simulatedPlayers = [
    { id: "1", nickname: "玩家1", status: "playing" },
    { id: "2", nickname: "玩家2", status: "playing" },
    { id: "3", nickname: "玩家3", status: "playing" },
    { id: "4", nickname: "玩家4", status: "playing" },
    { id: "5", nickname: "玩家5", status: "playing" },
  ];

  const [playersState, setPlayersState] = useState(simulatedPlayers);
  const [gameState, setGameState] = useState("countdown");
  const [countdown, setCountdown] = useState(3);
  const [chairs, setChairs] = useState([]);
  const [message, setMessage] = useState("");
  const [musicTrigger, setMusicTrigger] = useState(false);
  const [eliminatedNames, setEliminatedNames] = useState([]);

  useEffect(() => {
    const totalPlayers = playersState.length;
    const chairsCount = totalPlayers - (Math.floor(Math.random() * 3) + 1);
    const newChairs = [];

    for (let i = 0; i < chairsCount; i++) {
      const pos = getRandomPosition(
        newChairs,
        PLAYER_AREA_WIDTH,
        PLAYER_AREA_HEIGHT,
        CHAIR_SIZE
      );
      newChairs.push({ id: `chair-${i + 1}`, x: pos.x, y: pos.y, occupantId: null });
    }
    setChairs(newChairs);

    setPlayersState((prev) =>
      prev.map((p) => ({ ...p, chairId: null }))
    );
  }, []);

  useEffect(() => {
    if (gameState === "countdown") {
      setMusicTrigger(true);
    }
  }, [gameState]);

  const handleMusicStop = () => {
    setGameState("waiting");
    setMessage("音樂停止！快搶椅子！");
    setMusicTrigger(false);

    setTimeout(() => {
      nextRound();
    }, 5000); // 等待 5 秒自動進入下一輪
  };

  useEffect(() => {
    if (gameState === "countdown") {
      if (countdown === 0) {
        setCountdown(3);
      } else {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown, gameState]);

  const handleChairClick = (chairId) => {
    if (gameState !== "waiting") return;

    setChairs((prevChairs) => {
      const chair = prevChairs.find((c) => c.id === chairId);
      if (chair?.occupantId) return prevChairs;

      const playerId = "1";

      return prevChairs.map((c) =>
        c.id === chairId ? { ...c, occupantId: playerId } : c
      );
    });
  };

  useEffect(() => {
    const occupantMap = new Map();
    chairs.forEach((chair) => {
      if (chair.occupantId) occupantMap.set(chair.occupantId, chair.id);
    });

    setPlayersState((prevPlayers) =>
      prevPlayers.map((p) => {
        if (p.status !== "playing") return p;
        const chairId = occupantMap.get(p.id) || null;
        return { ...p, chairId };
      })
    );
  }, [chairs]);

  const nextRound = () => {
    const playingPlayers = playersState.filter((p) => p.status === "playing");
    const playersWithChair = playersState.filter((p) => p.chairId != null);
    const eliminated = playingPlayers.filter(
      (p) => !playersWithChair.some((pw) => pw.id === p.id)
    );

    let updatedPlayers = playersState;
    if (eliminated.length > 0) {
      updatedPlayers = playersState.map((p) =>
        eliminated.some((e) => e.id === p.id) ? { ...p, status: "eliminated" } : p
      );
      setPlayersState(updatedPlayers);
      setEliminatedNames(eliminated.map((p) => p.nickname));
    } else {
      setEliminatedNames([]);
    }

    const alivePlayers = updatedPlayers.filter((p) => p.status === "playing");
    if (alivePlayers.length <= 1) {
      setGameState("ended");
      setMessage(`遊戲結束！冠軍是 ${alivePlayers[0]?.nickname || "無人"}`);
      onGameEnd && onGameEnd(alivePlayers[0]);
      return;
    }

    const removeCount = Math.min(Math.floor(Math.random() * 3) + 1, chairs.length);
    const newChairs = chairs.slice(0, chairs.length - removeCount);

    const resetPlayers = updatedPlayers.map((p) =>
      p.status === "playing" ? { ...p, chairId: null } : p
    );

    setChairs(newChairs);
    setPlayersState(resetPlayers);
    setCountdown(3);
    setGameState("countdown");
    setMessage(`淘汰玩家：${eliminated.map((e) => e.nickname).join("、") || "無"}，剩下 ${alivePlayers.length} 人`);
  };

  const handlePlayerChoice = (playerId, choice) => {
    if (choice === "leave") {
      setPlayersState((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, status: "left" } : p))
      );
    } else if (choice === "watch") {
      setPlayersState((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, status: "watching" } : p))
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <GameMusicController
        isHost={true}
        startTrigger={musicTrigger}
        onMusicStop={handleMusicStop}
      />

      <div style={{ width: 250, borderRight: "1px solid #ccc", padding: "1rem", overflowY: "auto" }}>
        <h2>玩家列表</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {playersState.map((p) => (
            <li key={p.id} style={{ marginBottom: 10 }}>
              <b>{p.nickname}</b> — {p.status}
              {p.status === "eliminated" && (
                <div style={{ marginTop: 5 }}>
                  <button onClick={() => handlePlayerChoice(p.id, "leave")}>離開房間</button>
                  <button onClick={() => handlePlayerChoice(p.id, "watch")}>留下觀看</button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <hr />
        <div style={{ fontWeight: "bold", marginTop: 10 }}>{message}</div>
        {gameState === "ended" && (
          <button onClick={() => window.location.reload()}>重新開始遊戲</button>
        )}
      </div>

      <div
        style={{
          position: "relative",
          width: PLAYER_AREA_WIDTH,
          height: PLAYER_AREA_HEIGHT,
          backgroundColor: "#def",
          margin: "auto",
          borderRadius: 10,
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {gameState === "countdown" && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 48,
              fontWeight: "bold",
              color: "#333",
              zIndex: 10,
            }}
          >
            {countdown}
          </div>
        )}

        {chairs.map((chair) => (
          <div
            key={chair.id}
            onClick={() => handleChairClick(chair.id)}
            style={{
              position: "absolute",
              left: chair.x,
              top: chair.y,
              width: CHAIR_SIZE,
              height: CHAIR_SIZE,
              backgroundColor: chair.occupantId ? "#fa6" : "#ccc",
              borderRadius: 8,
              cursor: gameState === "waiting" && !chair.occupantId ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              userSelect: "none",
            }}
            title={chair.occupantId ? `已被玩家搶佔` : "點擊搶椅子"}
          >
            {chair.occupantId ? "🪑" : "椅子"}
          </div>
        ))}

        {chairs.map((chair) => {
          if (!chair.occupantId) return null;
          const occupant = playersState.find((p) => p.id === chair.occupantId);
          if (!occupant) return null;
          return (
            <div
              key={`name-${chair.id}`}
              style={{
                position: "absolute",
                left: chair.x,
                top: chair.y + CHAIR_SIZE + 5,
                width: CHAIR_SIZE,
                textAlign: "center",
                fontSize: 12,
                fontWeight: "bold",
                color: "#333",
                userSelect: "none",
              }}
            >
              {occupant.nickname}
            </div>
          );
        })}
      </div>
    </div>
  );
}
