import React from "react";
import GameClient from "./GameClient";

export default function GamePage() {
  return (
    <React.Suspense fallback={<div>載入中...</div>}>
      <GameClient />
    </React.Suspense>
  );
}
