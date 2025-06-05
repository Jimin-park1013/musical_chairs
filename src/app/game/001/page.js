"use client";

import { useEffect, useState } from "react";
import GameMusicController from "../../../components/GameMusicController";

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
  // 只用傳入玩家資料，不建立模擬玩家
  const [playersState, setPlayersState] = useState(() =>
    players.map((p) => ({ ...p, status: "playing", chairId: null }))
  );

  const [gameState, setGameState] = useState("countdown");
  const [countdown, setCountdown] = useState(3);
  const [chairs, setChairs] = useState([]);
  const [message, setMessage] = useState("");
  const [musicTrigger, setMusicTrigger] = useState(false);
  const [round, setRound] = useState(1);

  useEffect(() => {
    startRound(playersState);
  }, []);

  useEffect(() => {
    if (gameState === "countdown") {
      if (countdown === 0) {
        setGameState("waiting");
        setMusicTrigger(true);
        setCountdown(3);
      } else {
        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown, gameState]);

  const startRound = (currentPlayers) => {
    const alivePlayers = currentPlayers.filter((p) => p.status === "playing");

    // 若只剩1人，直接結束遊戲
    if (alivePlayers.length === 1) {
      setGameState("ended");
      setMessage(`🎉 遊戲結束！冠軍是 ${alivePlayers[0].nickname}`);
      onGameEnd?.(alivePlayers[0]);
      return;
    }

    const chairsCount = alivePlayers.length - 1;
    const newChairs = [];

    for (let i = 0; i < chairsCount; i++) {
      const pos = getRandomPosition(newChairs, PLAYER_AREA_WIDTH, PLAYER_AREA_HEIGHT, CHAIR_SIZE);
      newChairs.push({ id: `chair-${i + 1}`, x: pos.x, y: pos.y, occupantId: null });
    }

    setChairs(newChairs);
    setPlayersState((prev) =>
      prev.map((p) => (p.status === "playing" ? { ...p, chairId: null } : p))
    );
    setMessage(`第 ${round} 回合開始`);
    setGameState(round === 1 ? "countdown" : "waiting");
    setMusicTrigger(true);
  };

  const handleMusicStop = () => {
    setMusicTrigger(false);
    setGameState("evaluation");
    setMessage("音樂停止！等待搶椅子結果...");

    // 這裡需由外部(多端同步)決定 occupantId，這版本先不自動分配
    // 你可依網路同步資料更新椅子 occupantId

    // 模擬 AI 搶椅子（可刪除改由外部控制）
    setTimeout(() => {
      // 範例 AI 自動搶椅子：依序把玩家排上椅子，最後一人沒椅子被淘汰
      setChairs((prevChairs) => {
        const alivePlayers = playersState.filter((p) => p.status === "playing");
        let chairIndex = 0;
        const newChairs = [...prevChairs];
        for (let i = 0; i < alivePlayers.length - 1; i++) {
          if (chairIndex >= newChairs.length) break;
          newChairs[chairIndex] = {
            ...newChairs[chairIndex],
            occupantId: alivePlayers[i].id,
          };
          chairIndex++;
        }
        return newChairs;
      });

      setTimeout(() => {
        evaluateRound();
      }, 1500);
    }, 500);
  };

  const evaluateRound = () => {
    const chairMap = new Map();
    chairs.forEach((c) => {
      if (c.occupantId) chairMap.set(c.occupantId, c.id);
    });

    const updatedPlayers = playersState.map((p) => {
      if (p.status !== "playing") return p;
      const hasChair = chairMap.has(p.id);
      return {
        ...p,
        status: hasChair ? "playing" : "eliminated",
        chairId: hasChair ? chairMap.get(p.id) : null,
      };
    });

    setPlayersState(updatedPlayers);

    const alive = updatedPlayers.filter((p) => p.status === "playing");

    if (alive.length === 1) {
      setGameState("ended");
      setMessage(`🎉 遊戲結束！冠軍是 ${alive[0].nickname}`);
      onGameEnd?.(alive[0]);
    } else {
      setRound((r) => r + 1);
      setTimeout(() => {
        if (gameState !== "ended") startRound(updatedPlayers);
      }, 2000);
    }
  };

  const getNicknameById = (id) => {
    return playersState.find((p) => p.id === id)?.nickname || "";
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <GameMusicController
        isHost={true}
        startTrigger={musicTrigger}
        onMusicStop={handleMusicStop}
      />

      <div
        style={{
          width: 250,
          borderRight: "1px solid #ccc",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <h2>玩家列表</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {playersState.map((p) => (
            <li key={p.id} style={{ marginBottom: 10 }}>
              <b>{p.nickname}</b> — {p.status}
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
            style={{
              position: "absolute",
              left: chair.x,
              top: chair.y,
              width: CHAIR_SIZE,
              height: CHAIR_SIZE,
              backgroundColor: chair.occupantId ? "#fa6" : "#ccc",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              userSelect: "none",
              flexDirection: "column",
              fontSize: 12,
              textAlign: "center",
              padding: 4,
              cursor: "default",
            }}
            title={chair.occupantId ? `已被 ${getNicknameById(chair.occupantId)} 搶佔` : "椅子"}
          >
            {chair.occupantId ? (
              <>
                🪑
                <div style={{ fontSize: 10 }}>{getNicknameById(chair.occupantId)} 搶佔</div>
              </>
            ) : (
              "椅子"
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
