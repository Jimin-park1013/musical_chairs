"use client";

import GameMusicController from "../../../components/GameMusicController";
import { useState } from "react";

export default function RoomPage() {
  const [startTrigger, setStartTrigger] = useState(false);
  const isHost = true; // ⚠️ 你這裡要根據房主狀態動態決定

  const handleMusicStop = () => {
    console.log("🎮 可以開始搶椅子囉！");
    // 觸發搶椅子邏輯
  };

  const startGameRound = () => {
    console.log("🕹️ 新一輪開始！");
    setStartTrigger(false); // 確保重新觸發
    setTimeout(() => setStartTrigger(true), 100);
  };

  return (
    <div>
      <button onClick={startGameRound}>開始新一輪</button>

      <GameMusicController
        isHost={isHost}
        onMusicStop={handleMusicStop}
        startTrigger={startTrigger}
      />
    </div>
  );
}
